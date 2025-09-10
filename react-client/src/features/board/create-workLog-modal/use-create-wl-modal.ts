import { createGStore } from "create-gstore";
import { useState } from "react";

// Define a global state from a hook
export const useCreateWorkLogModal = createGStore(() => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, open, close };
});
 