import { useDraggable } from "@dnd-kit/core";

export default function DraggableDirector({ director }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: director.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="director-item"
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      {director.name}
    </div>
  );
}
