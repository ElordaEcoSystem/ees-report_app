import { Text, View } from "@react-pdf/renderer";
import { styles } from "./style";
import type { WorkLog } from "../board-type";
// import type { WorkOrderResponse } from "./type";

type TableProps = {
  data: WorkLog[];
  // userName: string
  monthIndex: number;
};

export const Table = ({ data, monthIndex }: TableProps) => {
  console.log("From table monthIndex = ", monthIndex);
  const filtered = data.filter((order) => {
    const created = new Date(order.createdAt);
    return created.getMonth() === monthIndex && created.getFullYear() === 2025;
  });
  return (
    <View style={[styles.table, styles.text, { marginTop: 28 }]}>
      <View style={[styles.tableRow, styles.header_table]}>
        <Text style={[styles.cell, styles.indexCell]}>№</Text>
        <Text style={styles.cell}>Дата</Text>
        <Text style={styles.cell}>Исполнитель</Text>
        <Text style={styles.cell}>Объект</Text>
        <Text style={[styles.cell, styles.lastCell]}>Работы</Text>
      </View>

      {/* Строки таблицы */}
      {filtered.map((item, idx) => (
        <View style={[styles.tableRow]} key={item.id}>
          <Text style={[styles.cell, styles.indexCell]}>{idx + 1}</Text>
          <Text style={styles.cell}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.cell}>{item.author.fullName}</Text>
          <Text style={styles.cell}>{item.object}</Text>
          <Text style={[styles.cell, styles.lastCell]}>
            {item.content ?? "—"}
          </Text>
        </View>
      ))}
    </View>
  );
};
