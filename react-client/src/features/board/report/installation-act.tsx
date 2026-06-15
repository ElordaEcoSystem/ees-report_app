import { SimpleAct } from "./simple-act";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof SimpleAct>, "contentHeader">;

export const InstallationAct = (props: Props) => (
  <SimpleAct {...props} contentHeader="Описание установки" />
);
