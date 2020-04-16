import { GRADES_URL, getAxiosInstance } from "./Session";
import cheerio from "react-native-cheerio";

// TODO: na pewno nie wysztko będzie stringiem, zmienić tak by miało to sens
export interface IGrade {
  index: number;
  courseName: string;
  type: string;
  graduator: string;
  numberOfHours: number;
  firstTerm: string;
  corrective: string;
  comission: string;
  ects: number;
}

async function fetchGrades(): Promise<IGrade[]> {
  const axiosInstance = await getAxiosInstance();

  const response = await axiosInstance.get(GRADES_URL);

  const $ = cheerio.load(response.data);

  const table = $(
    "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_dgDane > tbody > tr"
  );

  var grades: IGrade[] = [];

  for (let index = 1; index < table.length; index++) {
    const courseName = table[index].children[0].children[0].data;
    const type = table[index].children[1].children[0].data;
    const graduator = table[index].children[2].children[0].data;
    const numberOfHours = table[index].children[3].children[0].data;
    const firstTerm = table[index].children[4].children[0].data;
    const corrective = table[index].children[5].children[0].data;
    const comission = table[index].children[6].children[0].data;
    const ECTS = table[index].children[7].children[0].data;

    var item: IGrade = {
      index: index,
      courseName: courseName,
      type: type,
      graduator: graduator,
      numberOfHours: Number.parseInt(numberOfHours),
      firstTerm: firstTerm,
      corrective: corrective,
      comission: comission,
      ects: Number.parseInt(ECTS),
    };

    grades.push(item);
  }

  return grades;
}

export default fetchGrades;
