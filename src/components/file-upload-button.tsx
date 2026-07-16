import { forwardRef, useCallback } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useFilePicker, type PickedFile } from "@/hooks/use-file-picker";

type FileUploadButtonProps = ButtonProps & {
  accept?: string;
  multiple?: boolean;
  successLabel?: string;
  onFiles?: (files: PickedFile[]) => void;
};

export const FileUploadButton = forwardRef<HTMLButtonElement, FileUploadButtonProps>(
  function FileUploadButton(
    {
      accept = ".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv",
      multiple = false,
      successLabel = "File selected",
      onFiles,
      children,
      onClick,
      ...props
    },
    ref,
  ) {
    const handlePick = useCallback(
      (files: PickedFile[]) => {
        if (onFiles) {
          onFiles(files);
          return;
        }
        if (files.length === 1) {
          toast.success(successLabel, { description: files[0]!.name });
        } else {
          toast.success(successLabel, {
            description: `${files.length} files selected`,
          });
        }
      },
      [onFiles, successLabel],
    );

    const { open, inputProps } = useFilePicker({ accept, multiple, onPick: handlePick });

    return (
      <>
        <input {...inputProps} />
        <Button
          ref={ref}
          type="button"
          {...props}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) open();
          }}
        >
          {children}
        </Button>
      </>
    );
  },
);
