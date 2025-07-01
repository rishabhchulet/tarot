import { supabase, createTimeoutWrapper, testSupabaseConnection } from './supabase';
import { runFullDiagnostics } from './auth';

interface DiagnosticResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'INFO';
  duration?: number;
  details?: string;
  error?: string;
  data?: any;
}

interface DiagnosticReport {
  timestamp: string;
  environment: {
    platform: string;
    userAgent?: string;
    url?: string;
  };
  connectivity: DiagnosticResult[];
  auth: DiagnosticResult[];
  database: DiagnosticResult[];
  overall: {
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    criticalIssues: number;
    warnings: number;
    recommendations: string[];
  };
}

export class DiagnosticsManager {
  private static instance: DiagnosticsManager;
  private lastReport: DiagnosticReport | null = null;
  private isRunning = false;

  static getInstance(): DiagnosticsManager {
    if (!DiagnosticsManager.instance) {
      DiagnosticsManager.instance = new DiagnosticsManager();
    }
    return DiagnosticsManager.instance;
  }

  async runComprehensiveDiagnostics(): Promise<DiagnosticReport> {
    if (this.isRunning) {
      console.warn('🔍 Diagnostics already running, returning cached result');
      return this.lastReport || this.createEmptyReport();
    }

    this.isRunning = true;
    console.log('🔍 Starting comprehensive diagnostics...');

    try {
      const startTime = Date.now();
      
      const report: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        environment: this.getEnvironmentInfo(),
        connectivity: await this.testConnectivity(),
        auth: await this.testAuthentication(),
        database: await this.testDatabase(),
        overall: {
          status: 'HEALTHY',
          criticalIssues: 0,
          warnings: 0,
          recommendations: [],
        },
      };

      // Analyze overall health
      this.analyzeOverallHealth(report);

      const duration = Date.now() - startTime;
      console.log(`✅ Comprehensive diagnostics completed in ${duration}ms`);

      this.lastReport = report;
      return report;
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      return this.createErrorReport(error);
    } finally {
      this.isRunning = false;
    }
  }

  private getEnvironmentInfo() {
    const env = {
      platform: typeof window !== 'undefined' ? 'web' : 'native',
    };

    if (typeof window !== 'undefined') {
      env.userAgent = navigator.userAgent;
      env.url = window.location.href;
    }

    return env;
  }

  private async testConnectivity(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Test 1: Basic Supabase connectivity
    try {
      const startTime = Date.now();
      const { connected, error } = await testSupabaseConnection();
      const duration = Date.now() - startTime;

      results.push({
        name: 'Supabase Connectivity',
        status: connected ? 'PASS' : 'FAIL',
        duration,
        details: connected ? 'Successfully connected to Supabase' : 'Failed to connect',
        error: error || undefined,
      });
    } catch (error: any) {
      results.push({
        name: 'Supabase Connectivity',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 2: Network latency
    try {
      const startTime = Date.now();
      await fetch(process.env.EXPO_PUBLIC_SUPABASE_URL + '/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      const latency = Date.now() - startTime;

      results.push({
        name: 'Network Latency',
        status: latency < 1000 ? 'PASS' : latency < 3000 ? 'WARNING' : 'FAIL',
        duration: latency,
        details: `Response time: ${latency}ms`,
      });
    } catch (error: any) {
      results.push({
        name: 'Network Latency',
        status: 'FAIL',
        error: error.message,
      });
    }

    return results;
  }

  private async testAuthentication(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Test 1: Auth service availability
    try {
      const startTime = Date.now();
      const { data } = await createTimeoutWrapper(
        () => supabase.auth.getSession(),
        3000,
        { data: { session: null }, error: null }
      );
      const duration = Date.now() - startTime;

      results.push({
        name: 'Auth Service',
        status: 'PASS',
        duration,
        details: `Session check completed`,
        data: { hasSession: !!data.session },
      });
    } catch (error: any) {
      results.push({
        name: 'Auth Service',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 2: User data access
    try {
      const startTime = Date.now();
      const { data } = await supabase.auth.getUser();
      const duration = Date.now() - startTime;

      if (data.user) {
        results.push({
          name: 'User Data Access',
          status: 'PASS',
          duration,
          details: 'User data retrieved successfully',
          data: { userId: data.user.id },
        });
      } else {
        results.push({
          name: 'User Data Access',
          status: 'INFO',
          duration,
          details: 'No authenticated user',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'User Data Access',
        status: 'FAIL',
        error: error.message,
      });
    }

    return results;
  }

  private async testDatabase(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Test 1: Database connectivity
    try {
      const startTime = Date.now();
      await createTimeoutWrapper(
        () => supabase.from('users').select('count').limit(1),
        3000,
        null
      );
      const duration = Date.now() - startTime;

      results.push({
        name: 'Database Access',
        status: 'PASS',
        duration,
        details: 'Database query executed successfully',
      });
    } catch (error: any) {
      results.push({
        name: 'Database Access',
        status: 'FAIL',
        error: error.message,
      });
    }

    // Test 2: RLS policies
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const startTime = Date.now();
        const { data, error } = await createTimeoutWrapper(
          () => supabase.from('users').select('*').eq('id', user.id),
          3000,
          { data: null, error: null }
        );
        const duration = Date.now() - startTime;

        if (error) {
          results.push({
            name: 'RLS Policies',
            status: 'FAIL',
            duration,
            error: error.message,
          });
        } else {
          results.push({
            name: 'RLS Policies',
            status: 'PASS',
            duration,
            details: `User profile access working`,
            data: { profileFound: !!data },
          });
        }
      } else {
        results.push({
          name: 'RLS Policies',
          status: 'INFO',
          details: 'Skipped - no authenticated user',
        });
      }
    } catch (error: any) {
      results.push({
        name: 'RLS Policies',
        status: 'WARNING',
        error: error.message,
      });
    }

    return results;
  }

  private analyzeOverallHealth(report: DiagnosticReport) {
    const allResults = [
      ...report.connectivity,
      ...report.auth,
      ...report.database,
    ];

    const criticalIssues = allResults.filter(r => r.status === 'FAIL').length;
    const warnings = allResults.filter(r => r.status === 'WARNING').length;

    report.overall.criticalIssues = criticalIssues;
    report.overall.warnings = warnings;

    // Determine overall status
    if (criticalIssues > 0) {
      report.overall.status = 'CRITICAL';
    } else if (warnings > 0) {
      report.overall.status = 'DEGRADED';
    } else {
      report.overall.status = 'HEALTHY';
    }

    // Generate recommendations
    if (criticalIssues > 0) {
      report.overall.recommendations.push('Critical connectivity issues detected. Check internet connection.');
    }
    
    if (warnings > 0) {
      report.overall.recommendations.push('Some performance issues detected. Connection may be slow.');
    }

    const slowOperations = allResults.filter(r => r.duration && r.duration > 2000);
    if (slowOperations.length > 0) {
      report.overall.recommendations.push('Some operations are running slowly. This may affect user experience.');
    }

    if (report.overall.status === 'HEALTHY') {
      report.overall.recommendations.push('All systems are functioning normally.');
    }
  }

  private createEmptyReport(): DiagnosticReport {
    return {
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      connectivity: [],
      auth: [],
      database: [],
      overall: {
        status: 'CRITICAL',
        criticalIssues: 1,
        warnings: 0,
        recommendations: ['Unable to run diagnostics'],
      },
    };
  }

  private createErrorReport(error: any): DiagnosticReport {
    return {
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      connectivity: [
        {
          name: 'Diagnostics Error',
          status: 'FAIL',
          error: error.message || 'Unknown error',
        },
      ],
      auth: [],
      database: [],
      overall: {
        status: 'CRITICAL',
        criticalIssues: 1,
        warnings: 0,
        recommendations: ['Diagnostics failed to complete. Please try again.'],
      },
    };
  }

  getLastReport(): DiagnosticReport | null {
    return this.lastReport;
  }

  formatReportForUser(report: DiagnosticReport): string {
    const sections = [
      `🔍 System Health Report - ${new Date(report.timestamp).toLocaleString()}`,
      `📊 Overall Status: ${report.overall.status}`,
      '',
    ];

    if (report.overall.criticalIssues > 0) {
      sections.push(`❌ Critical Issues: ${report.overall.criticalIssues}`);
    }
    
    if (report.overall.warnings > 0) {
      sections.push(`⚠️ Warnings: ${report.overall.warnings}`);
    }

    sections.push('');
    sections.push('📋 Recommendations:');
    report.overall.recommendations.forEach(rec => {
      sections.push(`• ${rec}`);
    });

    return sections.join('\n');
  }
}

export const diagnostics = DiagnosticsManager.getInstance();