import clsx from "clsx";
interface Props {
  onClick?;
  wFull?: boolean;
  dragable?;
  colorClass?: string;
  className?: string;
  content: string;
  handleDrop?;
}
export default function Button({
  onClick,
  wFull,
  dragable,
  content,
  colorClass,
  handleDrop,
  className,
}: Props) {
  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // dropzoneRef.current.classList.add(classes.dropzoneActive);
  };

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // dropzoneRef.current.classList.remove(classes.dropzoneActive);
  };

  const _handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (handleDrop) {
      handleDrop(event);
    }
  };
  return (
    <div
      onClick={onClick ? onClick : () => {}}
      onDragOver={handleDrop ? handleDragOver : undefined}
      onDragLeave={handleDrop ? handleDragLeave : undefined}
      onDrop={_handleDrop}
      className={clsx(
        className,
        "py-2 pointer-events-auto my-2 rounded-md px-2 font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10",
        wFull ? "w-full" : "",
        dragable ? "border border-dashed border-slate-300" : "",
        colorClass || "bg-white hover:bg-slate-200"
      )}
    >
      {content}
    </div>
  );
}
