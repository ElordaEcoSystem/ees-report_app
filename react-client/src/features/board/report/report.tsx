import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import { getDaysInMonth } from "date-fns";
import { styles } from "./style";
import { monthNames } from "@/shared/model/months";
import { Table } from "./table";
import type { WorkLog } from "../board-type";
import type { Concordant } from "../concordants/use-concordants";
import { type DepartmentConfig, DEFAULT_DEPARTMENT_CONFIG } from "@/features/departments/registry";

type Props = {
  monthIndex: number;
  year: number;
  workLogList: WorkLog[];
  currentUserName: string | undefined;
  concordants: Concordant[];
  title: string;
  body: string;
  orientations?: Record<string, boolean>;
  departmentConfig?: DepartmentConfig;
  photoScale?: number;
};

export const Report = ({ monthIndex, year, workLogList, currentUserName, concordants, title, body, orientations = {}, departmentConfig = DEFAULT_DEPARTMENT_CONFIG, photoScale = 100 }: Props) => {
  const date = new Date(year, monthIndex);
  const numberOfDays = getDaysInMonth(date);


  const seenIds = new Set<string>();
  const uniqueExecutors: string[] = [];
  for (const wl of workLogList) {
    const people = [wl.author, ...(wl.executors ?? [])];
    for (const p of people) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniqueExecutors.push(p.fullName);
      }
    }
  }
  const executorsName = uniqueExecutors.length > 0 ? uniqueExecutors.join(", ") : (currentUserName ?? "");

  const processedBody = body
    .replace("{name}", executorsName)
    .replace("{days}", String(numberOfDays))
    .replace("{month}", monthNames.genitive[monthIndex])
    .replace("{year}", String(year));

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={[styles.page, styles.text]}>
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <Image src="logo.png" style={styles.img} />
            <View>
              <Text style={[styles.text_bold]}>
                ГКП на ПХВ «Elorda Eco System» акимата города Астана
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mainWrapper}>
          <View style={[{ textAlign: "center" }, styles.text_bold]}>
            {title.split("\n").map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>

          <View style={[styles.main_date, styles.text_bold]}>
            <Text>г. Астана</Text>
            <Text>
              «{numberOfDays}» {monthNames.genitive[monthIndex]} {year} г.
            </Text>
          </View>

          <Text style={styles.main_text}>{processedBody}</Text>

        </View>

        <Table data={workLogList} orientations={orientations} departmentConfig={departmentConfig} photoScale={photoScale} />
        <View>
          <Text  style={[styles.coordinating_text, styles.text_bold]}>Акт составлен и подписан членами комиссии:</Text>
        </View>
        {concordants.map((concordant, i) => (
          <View key={i} style={[styles.coordinating_text, styles.text_bold]}>
            <Text>{concordant.post}</Text>
            <Text>{concordant.fullName}</Text>
          </View>
        ))}

      </Page>
    </Document>
  );
};
