import { BASE_API_URL } from "@/shared/constans";
import { View, Image, StyleSheet } from "@react-pdf/renderer";
const styles = StyleSheet.create({
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "flex-start",
    marginTop: 24,
  },
  photo: {
    width: "32%", // 3 колонки
    marginBottom: 8,
  },
});

interface PhotoGridProps {
  photoURLs: string[];
}

export const PhotoGrid = ({ photoURLs }: PhotoGridProps) => {
  if (!photoURLs.length) return null;

  return (
    <View style={styles.grid}>
      {photoURLs.map((url, index) => (
        <Image key={index} src={`${BASE_API_URL}${url}`} style={styles.photo} />
      ))}
    </View>
  );
};
