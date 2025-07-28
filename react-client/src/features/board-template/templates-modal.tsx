import { LayoutModal } from "./templates-layout-modal";

export function TemplatesModal() {
  return (
    <LayoutModal title="text" form={<form></form>} footer={<div>footer</div>} />
  );
}
