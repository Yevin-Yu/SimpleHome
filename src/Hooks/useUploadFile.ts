import { ref, type Ref } from "vue";
import { useMessage } from "@/hooks/useMessage";

export const useUploadFile = (fileInput: Ref<HTMLInputElement | null>) => {
    const { showMessage } = useMessage();
    const currentFile = ref<File | null>(null);

    const isValidHtmlFile = (file: File): boolean => {
        return file.type === "text/html" || file.name.endsWith(".html");
    };

    const handleFileSelection = (file: File): void => {
        if (isValidHtmlFile(file)) {
            currentFile.value = file;
            showMessage(`已选择文件: ${file.name}`);
        } else {
            showMessage("请选择有效的HTML文件！");
            resetApp();
        }
    };

    const triggerFileInput = (): void => {
        fileInput.value?.click();
    };

    const handleDragOver = (e: DragEvent): void => {
        e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent): void => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent): void => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleFileChange = (e: Event): void => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const resetApp = (): void => {
        currentFile.value = null;
        if (fileInput.value) {
            fileInput.value.value = "";
        }
    };

    return {
        currentFile,
        triggerFileInput,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileChange,
        resetApp,
    };
};
