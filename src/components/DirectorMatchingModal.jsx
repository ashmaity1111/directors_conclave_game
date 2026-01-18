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

export default function DirectorMatchingModal({ onClose, onComplete }) {
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
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState({});

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

  // useEffect(() => {
  //   if (timeLeft === 0) return;
  //   const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
  //   return () => clearInterval(timer);
  // }, [timeLeft]);

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

  const handleResetAll = () => {
    // reset roles (remove all assignments)
    setRoles(groupByPlanet(filteredDirectors));

    // reset available directors pagination
    setAvailablePages(
      paginateAndShuffle(filteredDirectors, ITEMS_PER_PAGE)
    );

    // reset page & messages
    setPage(1);
    setActiveDirector(null);
    setLastMatch(null);
    setResetInfo(null);
    setSubmitted(false);
    setResults({});
  };

  const normalize = (val = "") => val.trim().toLowerCase();

const handleSubmitAnswers = () => {
  const evaluated = {};

  roles.forEach((role) => {
    if (!role.assigned) return;

    const dropped = role.assigned;
    const isCorrect =
      normalize(role.assigned.email) === normalize(dropped.email) &&
      normalize(role.photo_url) === normalize(dropped.photo_url);
    evaluated[role.id] = { isCorrect };
  });

  setResults(evaluated);
  setSubmitted(true);

  const correctCount = Object.values(evaluated).filter(r => r.isCorrect).length;
  const accuracy = Math.round((correctCount / roles.length) * 100);

  const finalResult = {
    score: correctCount * 100,
    correct: correctCount,
    total: roles.length,
    accuracy,
    timeTaken: 180 - timeLeft,
    performance: accuracy >= 70 ? "Good Job" : "Needs Practice",
  };

  // ⏳ WAIT 5 SECONDS → CLOSE THIS MODAL → OPEN RESULT MODAL
  setTimeout(() => {
    onComplete(finalResult);
  }, 5000);
};


  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-content">
         <div className="filters">
          <div className="matching"> DIRECTOR MATCHING CHALLENGE</div>
             
        <div className="tag planet">
          🌍 Planet: Enterprise Technology & Performance
        </div>
        <div className="tag geography">
          📍 Geography: Operations, Industry & Domain Solutions
        </div>
          <p>Technology Practice | Drag names to match the directors</p>
         
      </div>

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
                    submitted={submitted}
                    result={results[role.id]}
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
          {
            !submitted && 
           (  <p className="instruction">
            {instructionMessage}
          </p>)
          }
         
          {submitted && (
            <div className="result-summary">
              <strong className="error">
                ✖ {Object.values(results).filter(r => r.isCorrect).length}
                {" "}of {roles.length} directors correctly matched
              </strong>
              <strong className="success">
                +{Object.values(results).filter(r => r.isCorrect).length * 100}
                {" "}points for correct matches
              </strong>
              <strong className="error">
                {Object.values(results).filter(r => !r.isCorrect).length}
                {" "}incorrect matches
              </strong>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="actions">
            <button className="btn reset" onClick={handleResetAll}>Reset All</button>
            <button className="btn skip">Skip Challenge</button>
            <button className="btn submit" onClick={handleSubmitAnswers}>Submit Answers</button>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
