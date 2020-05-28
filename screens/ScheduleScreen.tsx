import moment from "moment";
import React from "react";
import { Alert, AsyncStorage, View } from "react-native";
import { Agenda, LocaleConfig } from "react-native-calendars";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Appbar, Caption, Subheading, Text, Title } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";
import { IEventItem, IMarked, ISchedule } from "../session/FetchSchedule";
import LoadingOverview from "./LoadingOverview";

moment.locale("pl");

LocaleConfig.locales["pl"] = {
  monthNames: [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ],
  monthNamesShort: [
    "Sty.",
    "Lut.",
    "Mar.",
    "Kwi.",
    "Maj",
    "Cze.",
    "Lip.",
    "Sie.",
    "Wrz.",
    "Paź.",
    "Lis.",
    "Gru.",
  ],
  dayNames: [
    "Niedziela",
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
  ],
  dayNamesShort: ["Nie.", "Pon.", "Wt.", "Śr.", "Czw.", "Pt.", "Sob."],
};
LocaleConfig.defaultLocale = "pl";

function ScheduleScreen() {
  const [loading, setLoading] = React.useState(false);
  const [scheduleTable, setScheduleTable] = React.useState<{
    [id: string]: IEventItem[];
  }>({});
  const [marked, setMarked] = React.useState<{ [id: string]: IMarked }>({});
  const [minDate, setMinDate] = React.useState<moment.Moment>(moment());
  const [maxDate, setMaxDate] = React.useState<moment.Moment>(moment());
  const [isOpen, setIsOpen] = React.useState(false);
  const [refreshingInterval, setRefreshingInterval] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      console.log("Data update");
      setLoading(true);

      const scheduleFromMemory = await AsyncStorage.getItem(
        "scheduleTableJSON"
      );
      var schedule: ISchedule = undefined;

      if (scheduleFromMemory) {
        schedule = JSON.parse(scheduleFromMemory, (key, value) => {
          if (
            key === "startTime" ||
            key === "date" ||
            key === "endTime" ||
            key === "minDate" ||
            key === "maxDate"
          ) {
            return moment(value);
          }
          return value;
        });
      }

      setScheduleTable(schedule.eventsTable);
      setMarked(schedule.marks);

      setMinDate(schedule.minDate);
      setMaxDate(schedule.maxDate);

      setRefreshingInterval(
        setInterval(() => {
          try {
            fetchData();
          } catch (error) {
            Alert.alert("Wystąpił nieoczekiwany błąd", JSON.stringify(error));
          }
        }, 60000)
      );

      setLoading(false);
    };

    try {
      fetchData();
    } catch (error) {
      Alert.alert("Wystąpił nieoczekiwany błąd", JSON.stringify(error));
    }

    return () => {
      clearInterval(refreshingInterval);
    };
  }, []);

  function renderItem(item: IEventItem) {
    var now = moment();
    const isNow =
      now.diff(item.startTime, "minutes") > 0 &&
      now.diff(item.endTime, "minutes") < 0;

    return (
      <TouchableOpacity style={isNow ? styles.itemNow : styles.item}>
        {isNow ? (
          <Subheading style={{ color: "#689f38" }}>trwają obecnie</Subheading>
        ) : (
          <Subheading
            style={
              item.startTime.diff(now, "minutes") > 0
                ? { color: "#00c853" }
                : { color: "#f44336" }
            }
          >
            {fromNow(item)}
          </Subheading>
        )}
        <Caption>
          {item.startTime.format("LT")} - {item.endTime.format("LT")}{" "}
        </Caption>
        <Title>{item.name}</Title>
        <Subheading>{item.classRoom}</Subheading>
      </TouchableOpacity>
    );
  }

  function renderEmptyDate() {
    return (
      <View style={styles.emptyData}>
        <Text style={styles.emptyDataText}>Brak zajęć w tym dniu</Text>
      </View>
    );
  }

  function renderEmptyData() {
    return (
      <View style={styles.emptyData}>
        <Text style={styles.emptyDataText}>Brak zajęć w tym dniu</Text>
      </View>
    );
  }

  const rowHasChanged = (r1: IEventItem, r2: IEventItem) => {
    return (
      r1.date !== r2.date &&
      r1.name !== r2.name &&
      r1.startTime !== r2.startTime
    );
  };

  const fromNow = (event: IEventItem) => {
    var now = moment();
    if (event.startTime.diff(now, "minutes") > 0) {
      return moment.duration(event.startTime.diff(now)).humanize(true);
    } else {
      return moment.duration(event.endTime.diff(now)).humanize(true);
    }
  };

  return (
    <View style={styles.flex}>
      <LoadingOverview visible={loading} />
      <Appbar.Header theme={{ colors: { primary: "#1e88e5" } }}>
        <Appbar.Content title="Wirtualna Uczelnia" />
      </Appbar.Header>
      <Agenda
        markedDates={marked}
        renderEmptyDate={renderEmptyDate}
        renderEmptyData={renderEmptyData}
        renderItem={renderItem}
        items={scheduleTable}
        rowHasChanged={rowHasChanged}
        minDate={minDate.format("YYYY-MM-DD")}
        maxDate={maxDate.format("YYYY-MM-DD")}
        pastScrollRange={7}
        futureScrollRange={7}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  flex: {
    flex: 1,
  },
  emptyData: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: "10@s",
    marginTop: "30@s",
  },
  emptyDataText: {
    fontSize: "16@s",
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: "10@s",
    marginRight: "10@s",
    marginTop: "17@s",
  },
  itemNow: {
    backgroundColor: "rgba(202, 234, 255, 0.7)",
    flex: 1,
    borderRadius: 5,
    padding: "10@s",
    marginRight: "10@s",
    marginTop: "17@s",
  },
  itemTitle: {
    fontSize: "18@s",
    padding: "5@s",
    lineHeight: "18@s",
  },
  itemCaption: {
    fontSize: "10@s",
    padding: "5@s",
  },
  itemSubheading: {
    fontSize: "12@s",
    padding: "5@s",
  },
});

export default ScheduleScreen;
