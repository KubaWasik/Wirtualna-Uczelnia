import * as Calendar from "expo-calendar";
import moment from "moment";
import "moment/locale/pl";
import React from "react";
import { Alert, AsyncStorage, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar as WixCalendar, LocaleConfig } from "react-native-calendars";
import Modal from "react-native-modal";
import { Avatar, Button, Caption, FAB, Headline, Subheading, Surface, Title } from "react-native-paper";
import Animated from "react-native-reanimated";
import { ScaledSheet } from "react-native-size-matters";
import BottomSheet from "reanimated-bottom-sheet";
import fetchSchedule, { IEventItem, IMarked, ISchedule } from "../session/FetchSchedule";
import { axiosInstance, SCHEDULE_DATA, SCHEDULE_URL } from "../session/Session";

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

interface IDay {
  dateString: string;
}

function ScheduleScreen() {
  const [scheduleTable, setScheduleTable] = React.useState<{
    [id: string]: IEventItem[];
  }>({});
  const [marked, setMarked] = React.useState<{ [id: string]: IMarked }>({});
  const [selectedDay, setSelectedDay] = React.useState<IEventItem[]>(null);
  const [selectedDayName, setSelectedDayName] = React.useState(moment());
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalData, setModalData] = React.useState<IEventItem>({
    address: "",
    classEndForm: "",
    classForm: "",
    classRoom: "",
    date: moment(),
    duration: "",
    endTime: moment(),
    name: "",
    startTime: moment(),
    teacher: "",
  });

  const bs = React.createRef<BottomSheet>();
  const fall = new Animated.Value(1);

  React.useEffect(() => {
    const fetchData = async () => {
      const useOffline = await AsyncStorage.getItem("offlineMode");
      const scheduleFromMemory = await AsyncStorage.getItem(
        "scheduleTableJSON"
      );
      var schedule: ISchedule = undefined;

      console.log("Offline mode: " + useOffline);

      if (useOffline && useOffline === "true") {
        if (scheduleFromMemory) {
          schedule = JSON.parse(scheduleFromMemory, (key, value) => {
            if (key === "startTime" || key === "date" || key === "endTime") {
              return moment(value);
            }
            return value;
          });
        }
      } else {
        const response = await axiosInstance.post(
          SCHEDULE_URL,
          { data: SCHEDULE_DATA },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        schedule = await fetchSchedule(response);
      }

      setScheduleTable(schedule.eventsTable);
      setMarked(schedule.marks);

      setScheduleTable(schedule.eventsTable);
      setMarked(schedule.marks);

      if (schedule.eventsTable[selectedDayName.format("YYYY-MM-DD")]) {
        setSelectedDay(
          schedule.eventsTable[selectedDayName.format("YYYY-MM-DD")]
        );
      } else {
        setSelectedDay(undefined);
      }

      // TODO: check for changes in schedule and notify user
      if (
        (schedule && JSON.stringify(schedule) !== scheduleFromMemory) ||
        (schedule && !scheduleFromMemory)
      ) {
        const json = JSON.stringify(schedule);
        await AsyncStorage.setItem("scheduleTableJSON", json);
      }
    };

    try {
      fetchData();
    } catch (error) {
      Alert.alert("Wystąpił nieoczekiwany błąd", JSON.stringify(error));
    }
  }, []);

  React.useEffect(() => {
    bs.current.snapTo(1);
  }, [selectedDayName, isOpen]);

  const renderInner = () => (
    <View style={styles.panel}>
      <WixCalendar
        style={styles.calendar}
        current={selectedDayName.format("YYYY-MM-DD")}
        minDate={"2019-09-01"}
        maxDate={"2020-07-01"}
        onDayPress={(day) => {
          bs.current.snapTo(1);
          showSelectedDay(day);
        }}
        onDayLongPress={(day) => {
          console.log("selected day", day);
        }}
        firstDay={1}
        markedDates={marked}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  const showSelectedDay = (day: IDay) => {
    const item = scheduleTable[day.dateString];

    setSelectedDayName(moment(day.dateString));
    setSelectedDay(item);
  };

  const showModal = (item: IEventItem) => {
    setModalData(item);
    setModalVisible(true);
  };

  const addToCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === "granted") {
      const calendars = await Calendar.getCalendarsAsync();
      console.log("Here are all your calendars:");
      console.log({ calendars });

      // TODO: save all events from scheduleTable
    } else {
      Alert.alert(
        "Brak uprawnień",
        "Aplikacja potrzebuje uprawnień do zapisywania danych w kalendarzu, zezwól aplikacji na dostęp do kalendarza i spróbuj ponownie"
      );
    }
  };

  // TODO: Pokazać aktualnie trwające zajęcia, optymalizacja kodu, ile dni do najbliższych zajęć
  const showClosestEvent = async () => {
    var found = false;
    const day = moment();

    if (scheduleTable[day.format("YYYY-MM-DD")]) {
      const daySchedule = scheduleTable[day.format("YYYY-MM-DD")];
      for (const key in daySchedule) {
        if (daySchedule.hasOwnProperty(key)) {
          const element = daySchedule[key];
          const next = moment(
            day.format("YYYY-MM-DD").toString() +
              " " +
              element.startTime.format("hh:mm")
          );
          const diffMinutes = next.diff(day, "minutes");
          if (diffMinutes > 0) {
            showModal(element);
            found = true;
            break;
          }
        }
      }
    }

    if (!found) {
      var flag = true;
      var i = 0;

      while (flag) {
        day.add(1, "d");
        if (scheduleTable[day.format("YYYY-MM-DD")]) {
          showModal(scheduleTable[day.format("YYYY-MM-DD")][0]);
          flag = false;
        }
        i++;
        if (i > 31) {
          Alert.alert(
            "Brak danych",
            "W najbliższym miesiącu nie znaleziono zajęć"
          );
          flag = false;
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Headline style={styles.modalHeader}>{modalData.name}</Headline>
          <View style={styles.modalIconRow}>
            <View style={styles.modalIcon}>
              <Avatar.Icon size={40} icon="clock" />
            </View>
            <View style={styles.modalIconRowText}>
              <Text style={styles.modalText}>
                {modalData.date.format("DD MMMM YYYY")}
              </Text>
              <Text style={styles.modalText}>
                {modalData.startTime.format("hh:mm") +
                  "-" +
                  modalData.endTime.format("hh:mm")}{" "}
                ({modalData.duration})
              </Text>
            </View>
          </View>
          <View style={styles.modalIconRow}>
            <View style={styles.modalIcon}>
              <Avatar.Icon size={40} icon="map-marker" />
            </View>
            <View style={styles.modalIconRowText}>
              <Text style={styles.modalText}>{modalData.classRoom}</Text>
              <Text style={styles.modalText}>{modalData.address}</Text>
            </View>
          </View>
          <View style={styles.modalIconRow}>
            <View style={styles.modalIcon}>
              <Avatar.Icon size={40} icon="teach" />
            </View>
            <Text style={styles.modalText}>{modalData.teacher}</Text>
          </View>
          <View style={styles.modalSmallRow}>
            <View>
              <Title style={styles.modalSubtitle}>Forma zajęć</Title>
              <Text style={styles.modalSmallText}>{modalData.classForm}</Text>
            </View>
            <View>
              <Title style={styles.modalSubtitle}>Forma zaliczenia</Title>
              <Text style={styles.modalSmallText}>
                {modalData.classEndForm}
              </Text>
            </View>
          </View>
          <Button
            style={styles.button}
            labelStyle={styles.buttonText}
            mode="outlined"
            onPress={() => setModalVisible(!modalVisible)}
          >
            Zamknij
          </Button>
        </View>
      </Modal>
      <BottomSheet
        ref={bs}
        snapPoints={["75%", "10%"]}
        renderContent={renderInner}
        renderHeader={renderHeader}
        initialSnap={1}
        callbackNode={fall}
        enabledInnerScrolling={true}
        enabledContentTapInteraction={false}
      />
      <Animated.View
        style={[
          styles.animatedView,
          { opacity: Animated.add(0.1, Animated.multiply(fall, 0.9)) },
        ]}
      >
        <Headline style={styles.selectedDayHeader}>
          {selectedDayName.format("DD MMMM YYYY")}
        </Headline>
        <ScrollView>
          {selectedDay === null ? (
            <View style={styles.emptyData}>
              <Text style={styles.emptyDataText}>Ładowanie</Text>
            </View>
          ) : selectedDay === undefined ? (
            <View style={styles.emptyData}>
              <Text style={styles.emptyDataText}>Brak zajęć w tym dniu</Text>
            </View>
          ) : (
            selectedDay.map((item) => (
              <TouchableOpacity
                key={
                  item.startTime.format("hh:mm") +
                  item.endTime.format("hh:mm") +
                  item.date
                }
                onPress={() => showModal(item)}
              >
                <Surface style={styles.item}>
                  <Caption style={styles.itemCaption}>
                    {item.startTime.format("hh:mm")} -{" "}
                    {item.endTime.format("hh:mm")}
                  </Caption>
                  <Title style={styles.itemTitle}>{item.name}</Title>
                  <Subheading style={styles.itemSubheading}>
                    {item.classRoom}
                  </Subheading>
                </Surface>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>
      <FAB.Group
        visible={true}
        style={{ zIndex: 999 }}
        open={isOpen}
        icon={isOpen ? "arrow-down" : "arrow-up"}
        actions={[
          {
            icon: "calendar-today",
            label: "Plan na dziś",
            onPress: () => {
              showSelectedDay({ dateString: moment().format("YYYY-MM-DD") });
            },
          },
          {
            icon: "calendar-range",
            label: "Pokaż najbliższe zajęcia",
            onPress: async () => await showClosestEvent(),
          },
          {
            icon: "calendar-export",
            label: "Zapisz w kalendarzu",
            onPress: async () => await addToCalendar(),
          },
        ]}
        onStateChange={() => setIsOpen(!isOpen)}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  emptyData: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDataText: {
    fontSize: "16@s",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20@s",
    marginBottom: "60@s",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    textAlign: "center",
    paddingTop: "10@s",
    paddingBottom: "10@s",
    fontSize: "22@s",
    lineHeight: "20@s",
  },
  modalIconRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: "20@s",
  },
  modalIcon: {
    paddingRight: "20@s",
  },
  modalIconRowText: {
    flexDirection: "column",
    height: "50@s",
  },
  modalSubtitle: {
    fontSize: "12@s",
  },
  modalSmallText: {
    fontSize: "10@s",
  },
  modalText: {
    fontSize: "18@s",
    flex: 1,
    flexWrap: "wrap",
  },
  modalSmallRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  panel: {
    height: "500@s",
    backgroundColor: "#2c2c2fAA",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  header: {
    backgroundColor: "#a0c8eb",
    shadowColor: "#000000",
    paddingTop: "20@s",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: "center",
  },
  panelHandle: {
    width: "40@s",
    height: "8@s",
    borderRadius: "4@s",
    backgroundColor: "#00000040",
    marginBottom: "10@s",
  },
  calendar: {
    height: "400@s",
  },
  animatedView: {
    alignItems: "center",
    paddingBottom: "100@s",
  },
  selectedDayHeader: {
    paddingTop: "15@s",
    fontSize: "20@s",
  },
  item: {
    backgroundColor: "#f2fdff",
    flex: 1,
    padding: "10@s",
    margin: "10@s",
    elevation: 2,
    borderRadius: 20,
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
  button: {
    width: "50%",
    marginTop: "20@s",
    marginBottom: "20@s",
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    fontSize: "12@s",
  },
});

export default ScheduleScreen;