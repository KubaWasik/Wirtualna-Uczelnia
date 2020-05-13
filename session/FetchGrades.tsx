import { AxiosInstance } from "axios";
import cheerio from "react-native-cheerio";
import { GRADES_URL } from "./Session";

export interface IGrade {
  graduator: string;
  numberOfHours: number;
  firstTerm: string;
  secondTerm: string;
  comission: string;
  ects: number;
}

export interface IGrades {
  [courseName: string]: { [gradeType: string]: IGrade };
}

async function fetchGrades(axiosInstance: AxiosInstance): Promise<IGrades> {
  const response = await axiosInstance.get(GRADES_URL);

  const $ = cheerio.load(response.data);

  const table = $(
    "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_dgDane > tbody > tr"
  );

  var grades: IGrades = {};

  for (let index = 1; index < table.length; index++) {
    const courseName = table[index].children[0].children[0].data;
    const gradeType = table[index].children[1].children[0].data;
    const graduator = table[index].children[2].children[0].data;
    const numberOfHours = table[index].children[3].children[0].data;
    const firstTerm = table[index].children[4].children[0].data;
    const secondTerm = table[index].children[5].children[0].data;
    const comission = table[index].children[6].children[0].data;
    const ects = table[index].children[7].children[0].data;

    var gradeItem: IGrade = {
      comission: comission,
      ects: Number.parseInt(ects),
      firstTerm: firstTerm,
      graduator: graduator,
      numberOfHours: Number.parseInt(numberOfHours),
      secondTerm: secondTerm,
    };

    if (courseName in grades) {
      var tmp = grades[courseName];
      tmp[gradeType] = gradeItem;
      grades[courseName] = tmp;
    } else {
      var tmp: { [gradeType: string]: IGrade } = {};
      tmp[gradeType] = gradeItem;
      grades[courseName] = tmp;
    }
  }

  return grades;
}

export default fetchGrades;
