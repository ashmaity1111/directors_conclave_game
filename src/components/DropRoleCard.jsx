import { useDroppable } from "@dnd-kit/core";

export default function DropRoleCard({ role, onCancel, submitted, result }) {
  const { setNodeRef, isOver } = useDroppable({
    id: role.id, 
  });

  let resultClass = "";

  if (submitted && role.assigned) {
    resultClass = result?.isCorrect ? "correct" : "wrong";
  }

  return (
    <div
      ref={setNodeRef}
      className={`role-card ${resultClass} ${isOver ? "over" : ""}`}
    >
      <img
        src={role.photo_url}
        alt="Role"
        className="role-avatar"
      />

      <div className="drop-zone">
        {role.assigned ? (
          <>
            <span>{role.assigned.name}</span>

            {submitted && (
              <span className="icon">
                {result?.isCorrect ? "✔" : "✖"}
              </span>
            )}

            {!submitted && (
              <button onClick={() => onCancel(role)}>✕</button>
            )}
          </>
        ) : (
          <span className="placeholder">Drag a name here</span>
        )}
      </div>
    </div>
  );
}

