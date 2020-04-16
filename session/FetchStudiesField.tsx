import { AsyncStorage } from "react-native";
import cheerio from "react-native-cheerio";
import { STUDIES_FIELDS_URL, getAxiosInstance } from "./Session";
import qs from "qs";
import { AxiosRequestConfig } from "axios";
import * as Sentry from '@sentry/browser';

export interface IField {
  id: number;
  label: string;
  value: number;
}

export async function fetchStudiesField(): Promise<IField[]> {
  const axiosInstance = await getAxiosInstance();

  const response = await axiosInstance.get(STUDIES_FIELDS_URL);

  const $ = cheerio.load(response.data);

  var fields: IField[] = [];
  var flag = true;
  var i = 0;
  while (flag) {
    const element = $(
      "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_rbKierunki_" +
        i.toString()
    );

    if (element.val() === undefined) {
      flag = false;
    }

    if (flag === true) {
      fields.push({
        id: i,
        label: element.next().text(),
        value: Number.parseInt(element.val()),
      });
      i++;
    }
  }

  return fields;
}

export async function setStudiesField(
  field: number,
  checked: boolean
): Promise<string> {
  const axiosInstance = await getAxiosInstance();

  const response = await axiosInstance.get(STUDIES_FIELDS_URL);

  const $ = cheerio.load(response.data);

  const inputsToPost = {};

  const hiddenInputs = $("input[type='hidden']");
  hiddenInputs.each((index, element) => {
    inputsToPost[element.attribs.name] = element.attribs.value;
  });

  inputsToPost["ctl00$ctl00$ContentPlaceHolder$RightContentPlaceHolder$rbKierunki"] = field.toString();
  inputsToPost["ctl00$ctl00$ContentPlaceHolder$RightContentPlaceHolder$Button1"] = "wybierz";

  const options: AxiosRequestConfig = {
    method: "POST",
    headers: {
      "Host": "wu.up.krakow.pl",
      "Connection": "keep-alive",
      "Content-Length": "2777",
      "Cache-Control": "max-age=0",
      "Origin": "https://wu.up.krakow.pl",
      "Upgrade-Insecure-Requests": "1",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36",
      "Sec-Fetch-Dest": "document",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Referer": "https://wu.up.krakow.pl/WU/KierunkiStudiow.aspx",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "pl,en-GB;q=0.9,en;q=0.8,en-US;q=0.7"
    },
    data: qs.stringify(inputsToPost),
    url: STUDIES_FIELDS_URL
  }

  const postResponse = await axiosInstance(options);

  if (postResponse.request.responseURL.includes("Ogloszenia")) {
    if (checked) {
      await AsyncStorage.setItem("rememberStudiesField", "true");
      console.log("rememberStudiesField set in memory to 'true'");
    } else {
      await AsyncStorage.setItem("rememberStudiesField", "false");
      console.log("rememberStudiesField set in memory to 'false'");
    }
  
    await AsyncStorage.setItem("studiesFieldNumber", field.toString());
    console.log("Saving studies field to memory: " + field);

    return "SUCCESS";
  } else {
    Sentry.setExtra("data", postResponse.config);
    Sentry.captureException(new Error("Wybór kierunku"));

    return postResponse.request.responseURL;
  }
}
