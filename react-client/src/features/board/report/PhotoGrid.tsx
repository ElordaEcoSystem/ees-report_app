import { View, Image, StyleSheet } from "@react-pdf/renderer";
import type { WorkLog } from "../board-type";

const PHOTO_HEIGHT = 190;
const GAP = 6;

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
    marginBottom: GAP,
  },
  cell: {
    flex: 1,
    height: PHOTO_HEIGHT,
    backgroundColor: "#f3f3f3",
    borderRadius: 4,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});

interface PhotoGridProps {
  workLogList: WorkLog[];
}

export const PhotoGrid = ({ workLogList }: PhotoGridProps) => {
  const allUrls = workLogList.flatMap((wl) => wl.photoUrls ?? []);
  if (!allUrls.length) return null;

  const rows: string[][] = [];
  for (let i = 0; i < allUrls.length; i += 2) rows.push(allUrls.slice(i, i + 2));

  return (
    <View style={styles.section}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row} wrap={false}>
          {row.map((url, ci) => (
            <View key={ci} style={styles.cell}>
              <Image src={url} style={styles.image} />
            </View>
          ))}
          {row.length === 1 && <View style={styles.cell} />}
        </View>
      ))}
    </View>
  );
};
