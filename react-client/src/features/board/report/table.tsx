import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { WorkLog } from "../board-type";
import { DEFAULT_DEPARTMENT_CONFIG, getFieldValue, type DepartmentConfig } from "@/features/departments/registry";

const PHOTO_COL_W = 330;

function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const initials = parts.slice(1).map(p => p[0].toUpperCase() + ".").join(" ");
  return `${parts[0]} ${initials}`;
}
// Внутренняя ширина ячейки (padding: 2 с каждой стороны)
const INNER_W = PHOTO_COL_W - 4;
const HALF_W = Math.floor(INNER_W / 2);

const s = StyleSheet.create({
  table: { borderWidth: 1, marginTop: 20 },
  row: { flexDirection: "row" },
  headerRow: { backgroundColor: "#eee" },
  cell: {
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    fontSize: 10,
  },
  noRight: { borderRightWidth: 0 },
  cIdx:   { width: 22, textAlign: "center" },
  cDate:  { width: 52 },
  cExec:  { width: 88 },
  cObj:   { width: 95 },
  cDesc:  { flex: 1 },
  cPhoto: { width: PHOTO_COL_W, padding: 2 },
  bold:   { fontWeight: 600 },
  subHeader: {
    fontSize: 8,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 2,
    width: HALF_W,
  },
});

const MIN_PHOTO_H = 65;

function photoH(total: number): number {
  if (total <= 1) return 140;
  if (total <= 2) return 110;
  if (total <= 4) return 90;
  return Math.max(MIN_PHOTO_H, 70);
}

/** Разбивает urls на строки: портрет — 2 в ряд, пейзаж — 1 в ряд */
function buildPhotoRows(urls: string[], orientations: Record<string, boolean>): string[][] {
  if (urls.length === 0) return [];
  const isPortrait = orientations[urls[0]] ?? false;
  const perRow = isPortrait ? 2 : 1;
  const rows: string[][] = [];
  for (let i = 0; i < urls.length; i += perRow) rows.push(urls.slice(i, i + perRow));
  return rows;
}

export function PhotoCell({
  photoUrls,
  beforePhotoUrls,
  orientations = {},
  maxH = 140,
}: {
  photoUrls: string[];
  beforePhotoUrls: string[];
  orientations?: Record<string, boolean>;
  maxH?: number;
}) {
  const hasBefore = beforePhotoUrls.length > 0;
  const QW = Math.floor(HALF_W / 2);

  if (hasBefore) {
    const beforeRows = buildPhotoRows(beforePhotoUrls, orientations);
    const afterRows  = buildPhotoRows(photoUrls, orientations);
    const beforePortrait = (orientations[beforePhotoUrls[0]] ?? false);
    const afterPortrait  = (orientations[photoUrls[0]] ?? false);

    // Каждая колонка считает высоту строки независимо — заполняет своё пространство без пустоты
    const beforeRowH = Math.max(MIN_PHOTO_H, Math.min(maxH, Math.floor(maxH / beforeRows.length)));
    const afterRowH  = Math.max(MIN_PHOTO_H, Math.min(maxH, Math.floor(maxH / afterRows.length)));

    return (
      <View style={{ flexDirection: "row" }}>
        {/* Колонка ДО */}
        <View style={{ width: HALF_W, borderRightWidth: 1, borderColor: "#000" }}>
          <Text style={s.subHeader}>До</Text>
          {beforeRows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row" }}>
              {row.map((url, ci) => (
                <Image
                  key={ci}
                  src={url}
                  style={{
                    width: beforePortrait && row.length === 2 ? QW : HALF_W,
                    height: beforeRowH,
                    objectFit: "contain",
                  }}
                />
              ))}
            </View>
          ))}
        </View>
        {/* Колонка ПОСЛЕ */}
        <View style={{ width: HALF_W }}>
          <Text style={s.subHeader}>После</Text>
          {afterRows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row" }}>
              {row.map((url, ci) => (
                <Image
                  key={ci}
                  src={url}
                  style={{
                    width: afterPortrait && row.length === 2 ? QW : HALF_W,
                    height: afterRowH,
                    objectFit: "contain",
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  const total = photoUrls.length;
  const isPortrait = orientations[photoUrls[0]] ?? false;

  if (isPortrait) {
    // Вертикальные: до 3 в ряд, высота не уменьшается
    const perRow = Math.min(total, 3);
    const photoW = Math.floor(INNER_W / perRow);
    const rows: string[][] = [];
    for (let i = 0; i < total; i += perRow) rows.push(photoUrls.slice(i, i + perRow));

    return (
      <View>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row" }}>
            {row.map((url, ci) => (
              <Image key={ci} src={url} style={{ width: photoW, height: maxH, objectFit: "contain" }} />
            ))}
          </View>
        ))}
      </View>
    );
  }

  // Горизонтальные: 2 в ряд
  const rowH = Math.round(photoH(total) * (maxH / 140));
  const rows: string[][] = [];
  for (let i = 0; i < total; i += 2) rows.push(photoUrls.slice(i, i + 2));

  return (
    <View>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row" }}>
          {row.map((url, ci) => (
            <Image key={ci} src={url} style={{ width: row.length === 1 ? INNER_W : HALF_W, height: rowH, objectFit: "contain" }} />
          ))}
        </View>
      ))}
    </View>
  );
}

type Props = {
  data: WorkLog[];
  orientations?: Record<string, boolean>;
  departmentConfig?: DepartmentConfig;
  photoScale?: number;
};

export const Table = ({ data, orientations = {}, departmentConfig = DEFAULT_DEPARTMENT_CONFIG, photoScale = 100 }: Props) => {
  const scaledMaxH = Math.round(140 * (photoScale / 100));
  const pdfFields = departmentConfig.fields.filter(f => f.showInPdf);

  return (
    <View style={[s.table, { fontFamily: "TimesNewRoman", fontSize: 10 }]}>
      <View style={[s.row, s.headerRow]}>
        <Text style={[s.cell, s.cIdx,  s.bold]}>№</Text>
        <Text style={[s.cell, s.cDate, s.bold]}>Дата</Text>
        <Text style={[s.cell, s.cExec, s.bold]}>Исполнители</Text>
        {pdfFields.map(f => (
          <Text key={f.key} style={[s.cell, s.bold, { width: f.pdfWidth ?? 80 }]}>{f.label}</Text>
        ))}
        <Text style={[s.cell, s.cDesc, s.bold]}>Работы</Text>
        <Text style={[s.cell, s.cPhoto, s.bold, s.noRight]}>Фото</Text>
      </View>

      {data.map((item, idx) => (
        <View key={item.id} style={s.row} wrap={false}>
          <Text style={[s.cell, s.cIdx]}>{idx + 1}</Text>
          <Text style={[s.cell, s.cDate]}>
            {new Date(item.createdAt).toLocaleDateString("ru-RU")}
          </Text>
          <Text style={[s.cell, s.cExec]}>
            {[item.author, ...(item.executors?.filter(e => e.id !== item.author.id) ?? [])].map(e => abbreviateName(e.fullName ?? "")).join(", ")}
          </Text>
          {pdfFields.map(f => (
            <Text key={f.key} style={[s.cell, { width: f.pdfWidth ?? 80 }]}>
              {getFieldValue(f, item) || "—"}
            </Text>
          ))}
          <Text style={[s.cell, s.cDesc]}>{item.content ?? "—"}</Text>
          <View style={[s.cell, s.cPhoto, s.noRight]}>
            <PhotoCell photoUrls={item.photoUrls ?? []} beforePhotoUrls={item.beforePhotoUrls ?? []} orientations={orientations} maxH={scaledMaxH} />
          </View>
        </View>
      ))}
    </View>
  );
};
