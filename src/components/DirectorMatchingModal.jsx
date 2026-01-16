import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";

import { groupByPlanet } from "../utils/groupByPlanet";
import { paginateAndShuffle } from "../utils/shuffle";

import DraggableDirector from "./DraggableDirector";
import DropRoleCard from "./DropRoleCard";
import { getFilteredDirectors } from "../utils/helpers";

export default function DirectorMatchingModal({ onClose }) {
  const ITEMS_PER_PAGE = 10;

  const [roles, setRoles] = useState(() =>
    groupByPlanet(getFilteredDirectors())
  );
  const [availablePages, setAvailablePages] = useState(() =>
    paginateAndShuffle(getFilteredDirectors(), ITEMS_PER_PAGE)
  );

  const [page, setPage] = useState(1);
  const [activeDirector, setActiveDirector] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [lastMatch, setLastMatch] = useState(null);
  const [resetInfo, setResetInfo] = useState(null);


  const currentAvailable = availablePages[page - 1] || [];
  const paginatedRoles = roles.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleDragStart = ({ active }) => {
    const director = currentAvailable.find(
      (d) => d && d.id === active.id
    );
    setActiveDirector(director || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveDirector(null);
    if (!over) return;

    const dragged = currentAvailable.find(
      (d) => d && d.id === active.id
    );
    if (!dragged) return;

    const targetRole = roles.find((r) => r.id === over.id);

    // BLOCK DROP IF ALREADY ASSIGNED
    if (targetRole?.assigned) {
      return;
    }

    // ASSIGN DIRECTOR
    setRoles((prev) =>
      prev.map((r) =>
        r.id === over.id ? { ...r, assigned: dragged } : r
      )
    );

    // SAVE LAST MATCH
    setLastMatch({
      directorName: dragged.name,
      roleTitle: targetRole.planet,
    });

    // REMOVE FROM AVAILABLE LIST
    setAvailablePages((prev) =>
      prev.map((p, i) =>
        i === page - 1
          ? p.map((d) => (d?.id === active.id ? null : d))
          : p
      )
    );
    setResetInfo(null);
  };


  const handleCancel = (role) => {
    if (!role.assigned) return;

    const removedDirectorName = role.assigned.name;
    setAvailablePages((prev) =>
      prev.map((p, i) => {
        if (i !== page - 1) return p;
        const idx = p.findIndex((d) => d === null);
        if (idx === -1) return p;
        const copy = [...p];
        copy[idx] = role.assigned;
        return copy;
      })
    );

    setRoles((prev) =>
      prev.map((r) =>
        r.id === role.id ? { ...r, assigned: null } : r
      )
    );

    // RESET MESSAGE STATE
    setLastMatch(null);
    setResetInfo({
      directorName: removedDirectorName,
    });
  };

  const filteredDirectors = getFilteredDirectors();

  const totalPages = Math.ceil(
    filteredDirectors.length / ITEMS_PER_PAGE
  );
  const matchedCount = roles?.filter((r) => r.assigned).length;
  const totalMatches = roles?.length;


  let instructionMessage = (
    <>Drag and drop director names onto the empty slots below each avatar</>
  );

  if (resetInfo) {
    instructionMessage = (
      <>
        🔄 <strong className="reset-warning">{resetInfo.directorName} removed. Drag a new name to assign.</strong>
        <br />
        <span className="sub-message">
          {matchedCount} of {totalMatches} directors matched
        </span>
      </>
    );
  }

  if (lastMatch && matchedCount < totalMatches) {
    instructionMessage = (
      <>
        ✅ <strong>{lastMatch.directorName}</strong> assigned to{" "}
        <strong>{lastMatch.roleTitle}</strong> position
        <br />
        <span className="sub-message">
          {matchedCount} of {totalMatches} directors matched
        </span>
      </>
    );
  }

  if (matchedCount === totalMatches) {
    instructionMessage = (
      <>
        ✅ <strong>All directors matched!</strong>
        <br />
        <span className="sub-message">
          Click <strong>"Submit Answers"</strong> to check your matches.
        </span>
      </>
    );
  }


  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-content">
          <h2>DIRECTOR MATCHING CHALLENGE</h2>
          <p>Technology Practice | Drag names to match the directors</p>

          {/* TOP BAR */}
          <div className="stats-bar">
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">SCORE</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">{matchedCount}/{totalMatches}</div>
              <div className="stat-label">MATCHED</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">{timeLeft}s</div>
              <div className="stat-label">TIME LEFT</div>
            </div>
          </div>


          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="layout">
              {/* LEFT */}
              <div className="roles">
                {paginatedRoles.map((role) => (
                  <DropRoleCard
                    key={role.id}
                    role={role}
                    onCancel={handleCancel}
                  />
                ))}
              </div>

              {/* RIGHT */}
              <div className="directors">
                <h4>AVAILABLE DIRECTORS</h4>
                <div className="directors-grid">
                  {currentAvailable
                    ?.filter(Boolean)
                    ?.map((d) => (
                      <DraggableDirector key={d.id} director={d} />
                    ))}
                </div>
              </div>
            </div>

            {/* ✅ DRAG OVERLAY */}
            <DragOverlay>
              {activeDirector && (
                <div className="drag-overlay">
                  {activeDirector.name}
                </div>
              )}
            </DragOverlay>
          </DndContext>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ◀ Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={page === i + 1 ? "active" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next ▶
            </button>
          </div>

          {/* INSTRUCTION */}
          <p className="instruction">
            {instructionMessage}
          </p>

          {/* ACTION BUTTONS */}
          <div className="actions">
            <button className="btn reset">Reset All</button>
            <button className="btn skip">Skip Challenge</button>
            <button className="btn submit">Submit Answers</button>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
