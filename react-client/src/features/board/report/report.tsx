// import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
// import { styles } from './style';
// import { Table } from './table';
// import { getDaysInMonth } from 'date-fns';
// import { WorkOrderResponse } from './type';
// import { PhotoGrid } from './PhotoGrid';
// import { monthNames } from './model';

// interface InvoicePDFProps {
//   workLogList: WorkOrderResponse[];
//   user: string;
//   monthIndex: number;
// }

// // export const InvoicePDF = ({ workLogList, user, monthIndex }: InvoicePDFProps) => {
// export const InvoicePDF = ({ workLogList,user,monthIndex }: InvoicePDFProps) => {
//   // const monthIndex  = 5;
//   // const user = "executor_name";
//   const date = new Date(2025, monthIndex);
//   const numberOfDays = getDaysInMonth(date);

//   const allPhotos = workLogList
//   .filter(order => order.createdBy.name === user && new Date(order.createdAt).getMonth() === monthIndex)
//   .flatMap(order => order.photoUrl || []);
//   console.log("fromInvoice",workLogList, user, monthIndex)
//   return (
//     <Document>
//       <Page size="A4" style={[styles.page, styles.text]}>
//         <View style={styles.headerWrapper}>
//           <View style={styles.header}>
//             <Image src="logo.jpg" style={styles.img} />
//             <View>
//               <Text style={[styles.text_bold]}>
//                 ГКП на ПХВ «Elorda Eco System» акимата города Астана
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.mainWrapper}>
//           <View style={[{ textAlign: 'center' }, styles.text_bold]}>
//             <Text>АКТ</Text>
//             <Text>
//               выполненных работ Службы информационных технологий{'\n'}
//               и автоматизированных систем
//             </Text>
//           </View>

//           <View style={[styles.main_date, styles.text_bold]}>
//             <Text>г. Астана</Text>
//             <Text>
//               «{numberOfDays}» {monthNames.genitive[monthIndex]} 2025 г.
//             </Text>
//           </View>

//           <Text style={styles.main_text}>
//             В период с 1 по {numberOfDays} {monthNames.genitive[monthIndex]} 2025 года инженерами КИП {user} на базе Предприятия успешно проведено плановое ремонтное обслуживание оборудования и систем, что позволило обеспечить бесперебойную работу насосных агрегатов и других технических устройств. В рамках проведения работ был выполнен ряд задач, связанных с диагностикой, сборкой, подключением и настройкой различных элементов насосных установок.
//            </Text>
//         </View>

//         <Table data={workLogList} userName={user} monthIndex={monthIndex}/>
//         <PhotoGrid photoURLs={allPhotos} />
//       </Page>
//     </Document>
//   );
// };

import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import { getDaysInMonth } from "date-fns";
import { styles } from "./style";
import { monthNames } from "@/shared/model/months";
import { Table } from "./table";
import { PhotoGrid } from "./PhotoGrid";
import type { WorkLog } from "../board-type";

type Props = {
  monthIndex: number;
  workLogList: WorkLog[];
  currentUserName: string | undefined;
};

const concordants = [
  {post:"Заместитель генерального директора",fullName:"А. Жагипаров"},
  {post:"Руководитель СЭОС",fullName:"Б. Шаймуханбетов"},
  {post:"Руководителя СЭНС",fullName:"Т. Козгумбаев"},
  {post:"Руководителя СИТиАС",fullName:"Е. Есимбеков "},
  {post:"Инженер АСУТП",fullName:"К. Есмухамбетов "},
  {post:"Инженер АСУТП",fullName:"Т. Жамантаев "},
  {post:"Инженер АСУТП",fullName:"А. Тютюньков "},
]

export const Report = ({ monthIndex, workLogList, currentUserName }: Props) => {
  const date = new Date(2025, monthIndex);
  const numberOfDays = getDaysInMonth(date);

  const allPhotos = workLogList.flatMap((order) => order.photoUrl || []);

  return (
    <Document>
      <Page size="A4" style={[styles.page, styles.text]}>
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
            <Text>АКТ</Text>
            <Text>
              выполненных работ Службы информационных технологий{"\n"}и
              автоматизированных систем
            </Text>
          </View>

          <View style={[styles.main_date, styles.text_bold]}>
            <Text>г. Астана</Text>
            <Text>
              «{numberOfDays}» {monthNames.genitive[monthIndex]} 2025 г.
            </Text>
          </View>

          <Text style={styles.main_text}>
            В период с 1 по {numberOfDays} {monthNames.genitive[monthIndex]}{" "}
            2025 года инженерами КИП {currentUserName} на базе Предприятия
            успешно проведено плановое ремонтное обслуживание оборудования и
            систем, что позволило обеспечить бесперебойную работу насосных
            агрегатов и других технических устройств. В рамках проведения работ
            был выполнен ряд задач, связанных с диагностикой, сборкой,
            подключением и настройкой различных элементов насосных установок.
          </Text>

        </View>

        <Table data={workLogList} monthIndex={monthIndex} />
        <View>
          <Text  style={[styles.coordinating_text, styles.text_bold]}>Акт составлен и подписан членами комиссии:</Text>
        </View>
        {concordants.map((concordant)=>{
          return (
            <View style={[styles.coordinating_text, styles.text_bold]}>
              <Text>{concordant.post}</Text>
              <Text>{concordant.fullName}</Text>
            </View>
          )
        })}

        <PhotoGrid photoURLs={allPhotos} />
      </Page>
    </Document>
  );
};
