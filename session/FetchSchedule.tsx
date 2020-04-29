import { AxiosInstance, AxiosRequestConfig } from "axios";
import moment from "moment";
import qs from "qs";
import cheerio from "react-native-cheerio";
import { SCHEDULE_URL } from "./Session";

export interface IEventItem {
  date: moment.Moment;
  name: string;
  startTime: moment.Moment;
  endTime: moment.Moment;
  duration: string;
  teacher: string;
  classRoom: string;
  address: string;
  classForm: string;
  classEndForm: string;
}

export interface IMarked {
  marked: boolean;
}

export interface ISchedule {
  eventsTable: { [id: string]: IEventItem[] };
  marks: { [id: string]: IMarked };
  minDate: moment.Moment;
  maxDate: moment.Moment;
}

const getSchedule = async (axiosInstance: AxiosInstance) => {
  const getResponse = await axiosInstance.get(SCHEDULE_URL);
  const $ = cheerio.load(getResponse.data);
  const scheduleInputsToPost = {};
  const hiddenScheduleInputs = $("input[type='hidden']");
  hiddenScheduleInputs.each((index, element) => {
    scheduleInputsToPost[element.attribs.name] = element.attribs.value
      ? element.attribs.value
      : "";
  });

  scheduleInputsToPost[
    "ctl00$ctl00$ContentPlaceHolder$RightContentPlaceHolder$rbJak"
  ] = "Semestralnie";

  const options: AxiosRequestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(scheduleInputsToPost),
    url: SCHEDULE_URL,
  };

  const response = await axiosInstance(options);

  return response;
};

const fetchSchedule = async (
  axiosInstance: AxiosInstance
): Promise<ISchedule> => {
  const response = await getSchedule(axiosInstance);
  const $ = cheerio.load(response.data);

  const term = $(
    "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_lblData"
  ).text();
  const termTable = term.split(" ");
  const termStart = termTable[1];
  const termEnd = termTable[3];
  const termStartMoment = moment(termStart, "DD.MM.YYYY");
  const day = moment(termStart, "DD.MM.YYYY");
  const termEndMoment = moment(termEnd, "DD.MM.YYYY");

  const table = $(
    "#ctl00_ctl00_ContentPlaceHolder_RightContentPlaceHolder_dgDane > tbody > tr"
  );
  var scheduleTable: { [id: string]: IEventItem[] } = {};
  var marks: { [id: string]: IMarked } = {};

  while (!day.isSame(termEndMoment)) {
    scheduleTable[day.format("YYYY-MM-DD")] = [];
    marks[day.format("YYYY-MM-DD")] = { marked: false };
    day.add(1, "day");
  }

  for (let index = 1; index < table.length; index++) {
    const date = table[index].children[0].children[0].data;
    const startTime = table[index].children[1].children[0].data;
    const endTime = table[index].children[2].children[0].data;
    const name = table[index].children[3].children[0].data;
    const teacher = table[index].children[4].children[0].children[0].data;
    const classRoom = table[index].children[5].children[0].data;
    const address = table[index].children[6].children[0].data;
    const classForm = table[index].children[7].children[0].data;
    const classEndForm = table[index].children[8].children[0].data;

    const dateMoment = moment(date, "DD.MM.YYYY");
    const startMoment = moment(
      dateMoment.format("YYYY-MM-DD").toString() + " " + startTime
    );
    const endMoment = moment(
      dateMoment.format("YYYY-MM-DD").toString() + " " + endTime
    );
    const hours = endMoment.diff(startMoment, "hours");
    const mins = moment
      .utc(moment(endMoment, "HH:mm:ss").diff(moment(startMoment, "HH:mm:ss")))
      .format("mm");
    const duration = (hours != 0 ? hours + " h " : "") + mins + " min";

    var dateString = dateMoment.format("YYYY-MM-DD");

    if (marks[dateString].marked) {
      scheduleTable[dateString] = [
        {
          name: name,
          startTime: startMoment,
          endTime: endMoment,
          duration: duration,
          teacher: teacher,
          classRoom: classRoom,
          address: address,
          classForm: classForm,
          classEndForm: classEndForm,
          date: dateMoment,
        },
      ];
      marks[dateString] = { marked: true };
    } else {
      scheduleTable[dateString].push({
        name: name,
        startTime: startMoment,
        endTime: endMoment,
        duration: duration,
        teacher: teacher,
        classRoom: classRoom,
        address: address,
        classForm: classForm,
        classEndForm: classEndForm,
        date: dateMoment,
      });
    }
  }

  console.log("returning schedule");

  return { eventsTable: scheduleTable, marks: marks, minDate: termStartMoment, maxDate: termEndMoment };
};

export default fetchSchedule;
