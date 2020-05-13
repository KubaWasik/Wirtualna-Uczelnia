import { AxiosInstance } from "axios";
import cheerio from "react-native-cheerio";
import { Session, PROFILE_URL } from "./Session";

export interface IDataItem {
  key: number;
  title: string;
  description: string;
}

async function fetchUserData(axiosInstance: AxiosInstance): Promise<IDataItem[]> {
  const response = await axiosInstance.get(PROFILE_URL);
  const $ = cheerio.load(response.data);
  const table = $(
    "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_tab > tbody > tr"
  );
  var items: IDataItem[] = [];

  for (let index = 0; index < table.length; index++) {
    var name: string = undefined;
    var value: string = undefined;

    if (index === 3) {
      name =
        table[index].children[0].children[0].data +
        " " +
        table[index].children[0].children[2].data;

      const spec1 = $(
        "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_tab tr:nth-child(4) td:nth-child(2) tr:nth-child(2) td:nth-child(1)"
      ).text();
      // or this
      // epic shit:    Main Table tr --> MT td --> Inner Table -> IT tbody -> IT tr -----> IT td ---> IT td text node
      // const spec1 = table[tableIndex].children[1].children[0].children[0].children[1].children[0].children[0].data;
      const spec2 = $(
        "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_tab tr:nth-child(4) td:nth-child(2) tr:nth-child(2) td:nth-child(2)"
      ).text();
      // const spec2 = table[tableIndex].children[1].children[0].children[0].children[1].children[1].children[0].data;
      const typ = $(
        "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_tab tr:nth-child(4) td:nth-child(2) tr:nth-child(2) td:nth-child(3)"
      ).text();
      // const typ = table[tableIndex].children[1].children[0].children[0].children[1].children[2].children[0].data;
      value = spec1 + ", " + spec2 + ", " + typ;
    } else {
      name = table[index].children[0].children[0].data;
      value = table[index].children[1].children[0].data;
    }

    items.push({ key: index, title: name, description: value });
  }

  return items;
}

export default fetchUserData;
