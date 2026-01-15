import { useDroppable } from "@dnd-kit/core";

export default function DropRoleCard({ role, onCancel }) {
  const { setNodeRef, isOver } = useDroppable({
    id: role.id,
  });

  return (
    <div className="role-card">
      <img
        src={role.photo_url}
        alt="Role"
        className="role-avatar"
      />

      <h4 className="role-title">{role.planet}</h4>
      <span className="subtitle">{role.geography}</span>

      <div
        ref={setNodeRef}
        className={`drop-zone ${isOver ? "active" : ""}`}
      >
        {role.assigned ? (
          <div className="assigned-director">
            <span>{role.assigned.name}</span>

            {/* ❌ appears ONLY after drop */}
            <button
              className="cancel-btn"
              onClick={() => onCancel(role)}
            >
              ✕
            </button>
          </div>
        ) : (
          "Drag a name here"
        )}
      </div>
    </div>
  );
}

