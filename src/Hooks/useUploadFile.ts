import { ref, type Ref } from "vue";
import { useMessage } from "@/hooks/useMessage";

const { showMessage } = useMessage();

export function useUploadFile(fileInput: Ref<HTMLInputElement | null>) {
    const currentFile = ref<File | null>(null);

    const triggerFileInput = () => {
        fileInput.value?.click();
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleFileChange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        if (file.type === "text/html" || file.name.endsWith(".html")) {
            currentFile.value = file;
            showMessage(`已选择文件: ${file.name}`);
        } else {
            showMessage("请选择有效的HTML文件！");
            resetApp();
        }
    };

    const resetApp = () => {
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
}
