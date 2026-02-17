import type React from "react"

declare module "qrcode" {
  export function toDataURL(text: string, options?: any): Promise<string>
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: any): Promise<void>
  export function toString(text: string, options?: any): Promise<string>
}

declare module "adm-zip" {
  class AdmZip {
    constructor(filePath?: string)
    addFile(entryName: string, data: Buffer, comment?: string): void
    addLocalFile(localPath: string, zipPath?: string, zipName?: string): void
    extractAllTo(targetPath: string, overwrite?: boolean): void
    toBuffer(): Buffer
    writeZip(targetFileName?: string): void
    getEntries(): Array<{
      entryName: string
      isDirectory: boolean
      getData(): Buffer
    }>
  }
  export = AdmZip
}

declare module "@/components/reservation-flow" {
  export const ReservationFlow: React.ComponentType<any>
}

declare module "react-hot-toast" {
  export interface Toast {
    id: string
    message: string
    type: "success" | "error" | "loading" | "blank" | "custom"
  }

  export interface ToasterProps {
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
    reverseOrder?: boolean
    gutter?: number
    containerClassName?: string
    containerStyle?: React.CSSProperties
    toastOptions?: {
      className?: string
      duration?: number
      style?: React.CSSProperties
    }
  }

  export const Toaster: React.ComponentType<ToasterProps>
  export const toast: {
    (message: string, options?: any): string
    success(message: string, options?: any): string
    error(message: string, options?: any): string
    loading(message: string, options?: any): string
    custom(jsx: React.ReactNode, options?: any): string
    promise<T>(
      promise: Promise<T>,
      msgs: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((err: any) => string)
      },
      options?: any,
    ): Promise<T>
    dismiss(toastId?: string): void
    remove(toastId?: string): void
  }
}
