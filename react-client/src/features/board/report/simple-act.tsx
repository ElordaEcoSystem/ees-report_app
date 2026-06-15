import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import { styles } from "./style";
import { monthNames } from "@/shared/model/months";
import type { WorkLog } from "../board-type";
import type { Concordant } from "../concordants/use-concordants";
import { PhotoCell } from "./table";
import { type DepartmentConfig, DEFAULT_DEPARTMENT_CONFIG, getFieldValue } from "@/features/departments/registry";

type Props = {
  workLogList: WorkLog[];
  currentUserName: string | undefined;
  concordants: Concordant[];
  title: string;
  body: string;
  contentHeader: string;
  orientations?: Record<string, boolean>;
  departmentConfig?: DepartmentConfig;
  photoScale?: number;
};

const PHOTO_COL_W = 330;

export const SimpleAct = ({
  workLogList,
  currentUserName,
  concordants,
  title,
  body,
  contentHeader,
  orientations = {},
  departmentConfig = DEFAULT_DEPARTMENT_CONFIG,
  photoScale = 100,
}: Props) => {
  const scaledMaxH = Math.round(140 * (photoScale / 100));
  const pdfFields = departmentConfig.fields.filter(f => f.showInPdf);
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")} ${monthNames.genitive[today.getMonth()]} ${today.getFullYear()} г.`;
  const processedBody = body.replace("{name}", currentUserName ?? "");

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={[styles.page, styles.text]}>
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <Image src="logo.png" style={styles.img} />
            <View>
              <Text style={styles.text_bold}>
                ГКП на ПХВ «Elorda Eco System» акимата города Астана
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mainWrapper}>
          <View style={[{ textAlign: "center" }, styles.text_bold]}>
            {title.split("\n").map((line, i) => <Text key={i}>{line}</Text>)}
          </View>
          <View style={[styles.main_date, styles.text_bold]}>
            <Text>г. Астана</Text>
            <Text>{dateStr}</Text>
          </View>
          <Text style={styles.main_text}>{processedBody}</Text>
        </View>

        <View style={[styles.table, { marginTop: 16 }]}>
          <View style={[styles.tableRow, styles.header_table]}>
            <View style={[styles.cell, styles.indexCell]}>
              <Text style={styles.text_bold}>№</Text>
            </View>
            <View style={[styles.cell, { width: 52 }]}>
              <Text style={styles.text_bold}>Дата</Text>
            </View>
            {pdfFields.map(f => (
              <View key={f.key} style={[styles.cell, { width: f.pdfWidth ?? 80 }]}>
                <Text style={styles.text_bold}>{f.label}</Text>
              </View>
            ))}
            <View style={[styles.cell, { flex: 1 }]}>
              <Text style={styles.text_bold}>{contentHeader}</Text>
            </View>
            <View style={[styles.cell, { width: PHOTO_COL_W, borderRightWidth: 0 }]}>
              <Text style={styles.text_bold}>Фото</Text>
            </View>
          </View>
          {workLogList.map((wl, i) => (
            <View key={wl.id} style={styles.tableRow} wrap={false}>
              <View style={[styles.cell, styles.indexCell]}>
                <Text>{i + 1}</Text>
              </View>
              <View style={[styles.cell, { width: 52 }]}>
                <Text>{new Date(wl.createdAt).toLocaleDateString("ru-RU")}</Text>
              </View>
              {pdfFields.map(f => (
                <View key={f.key} style={[styles.cell, { width: f.pdfWidth ?? 80 }]}>
                  <Text>{getFieldValue(f, wl) || "—"}</Text>
                </View>
              ))}
              <View style={[styles.cell, { flex: 1 }]}>
                <Text>{wl.content}</Text>
              </View>
              <View style={[styles.cell, { width: PHOTO_COL_W, borderRightWidth: 0, padding: 2 }]}>
                <PhotoCell
                  photoUrls={wl.photoUrls ?? []}
                  beforePhotoUrls={wl.beforePhotoUrls ?? []}
                  orientations={orientations}
                  maxH={scaledMaxH}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={[styles.text_bold, { marginBottom: 8 }]}>
            Акт составлен и подписан членами комиссии:
          </Text>
        </View>
        {concordants.map((c, i) => (
          <View key={i} style={[styles.coordinating_text, styles.text_bold]}>
            <Text>{c.post}</Text>
            <Text>{c.fullName}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};
