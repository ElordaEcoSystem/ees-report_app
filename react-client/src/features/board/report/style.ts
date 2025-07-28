import { Font, StyleSheet } from "@react-pdf/renderer";

// timesnrcyrmt.ttf

Font.register({
  family: "TimesNewRoman",
  fonts: [
    { src: "/fonts/kztimesnewroman.ttf" }, // font-style: normal, font-weight: normal
    { src: "/fonts/timesnrcyrmt_bold.ttf", fontWeight: 600 },
  ],
});
export const styles = StyleSheet.create({
  text: {
    fontFamily: "TimesNewRoman",
    fontSize: 12,
    //  letterSpacing: 0.2,
  },
  text_bold: {
    fontWeight: 600,
  },
  page: {
    backgroundColor: "#fff",
    paddingLeft: 56,
    paddingTop: 28,
    paddingRight: 28,
    paddingBottom: 28,
    display: "flex",
    flexDirection: "column",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  img: {
    width: 70,
  },
  headerWrapper: {
    alignItems: "center",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  mainWrapper: {
    marginTop: 28,
    display: "flex",
    flexDirection: "column",
  },
  main_text: {
    textIndent: 28,
    marginTop: 14,
  },
  main_date: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  //table
  table: {
    borderWidth: 1,
    // border borderColor: '#000',
  },
  tableRow: {
    flexDirection: "row",
    // flexWrap="wrap"
  },
  header_table: {
    backgroundColor: "#eee",
  },
  cell: {
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    flex: 1,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  indexCell: {
    flex: 0.5,
    // padding: 4,
    // borderRight: '1px solid #000',
    textAlign: "center",
  },
});
