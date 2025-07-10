import { Kerykeion } from 'kerykeion';

export interface AstrologicalPlacements {
  sun: { sign: string };
  moon: { sign:string };
  rising: { sign: string };
  northNode: { sign: string, house: string };
  planets: { [key: string]: { sign: string, house: string } };
}

export const getAstrologicalPlacements = async (
  name: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  min: number,
  city: string
): Promise<AstrologicalPlacements | null> => {
  try {
    const user = new Kerykeion(name, year, month, day, hour, min, city);

    const sun = await user.getSun();
    const moon = await user.getMoon();
    const rising = await user.getAscendant();
    const northNode = await user.getNorthNode();

    const mercury = await user.getMercury();
    const venus = await user.getVenus();
    const mars = await user.getMars();
    const jupiter = await user.getJupiter();
    const saturn = await user.getSaturn();
    const uranus = await user.getUranus();
    const neptune = await user.getNeptune();
    const pluto = await user.getPluto();
    
    // This is a simplified structure. We can add more details later.
    return {
      sun: { sign: sun.sign },
      moon: { sign: moon.sign },
      rising: { sign: rising.sign },
      northNode: { sign: northNode.sign, house: northNode.house.number },
      planets: {
        Mercury: { sign: mercury.sign, house: mercury.house.number },
        Venus: { sign: venus.sign, house: venus.house.number },
        Mars: { sign: mars.sign, house: mars.house.number },
        Jupiter: { sign: jupiter.sign, house: jupiter.house.number },
        Saturn: { sign: saturn.sign, house: saturn.house.number },
        Uranus: { sign: uranus.sign, house: uranus.house.number },
        Neptune: { sign: neptune.sign, house: neptune.house.number },
        Pluto: { sign: pluto.sign, house: pluto.house.number },
      },
    };
  } catch (error) {
    console.error("Error calculating astrological placements:", error);
    return null;
  }
}; 