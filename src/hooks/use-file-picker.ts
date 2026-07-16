import { useCallback, useRef, type ChangeEvent } from "react";

export type PickedFile = {
  name: string;
  size: number;
  type: string;
};

type UseFilePickerOptions = {
  accept?: string;
  multiple?: boolean;
  onPick: (files: PickedFile[]) => void;
};

export function useFilePicker({
  accept = "*/*",
  multiple = false,
  onPick,
}: UseFilePickerOptions) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const open = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  }, []);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files;
      if (!list || list.length === 0) return;
      const files = Array.from(list).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      onPick(files);
    },
    [onPick],
  );

  const inputProps = {
    ref: inputRef,
    type: "file" as const,
    accept,
    multiple,
    className: "sr-only",
    tabIndex: -1,
    "aria-hidden": true as const,
    onChange,
  };

  return { open, inputProps };
}
