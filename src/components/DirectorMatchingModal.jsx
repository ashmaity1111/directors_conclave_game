import {
    DndContext,
    closestCenter,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
  } from "@dnd-kit/core";
  
import { useEffect, useState } from "react";
import directorsData from "../data/directory.json";
import { groupByPlanet } from "../utils/groupByPlanet";
import DraggableDirector from "./DraggableDirector";
import DropRoleCard from "./DropRoleCard";

export default function DirectorMatchingModal({ onClose }) {
    const [available, setAvailable] = useState(directorsData);
    const [roles, setRoles] = useState(groupByPlanet(directorsData));
    const [activeDirector, setActiveDirector] = useState(null);
    const [timeLeft, setTimeLeft] = useState(94);


    const handleDragStart = ({ active }) => {
        const director = available.find((d) => d.id === active.id);
        setActiveDirector(director);
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const dragged = available.find((d) => d.id === active.id);
        if (!dragged) return;

        // Assign director to role
        setRoles((prev) =>
            prev.map((r) =>
                r.id === over.id ? { ...r, assigned: dragged } : r
            )
        );

        // Remove from available
        setAvailable((prev) =>
            prev.filter((d) => d.id !== active.id)
        );
    };

    // ❌ Cancel handler
    const handleCancel = (role) => {
        if (!role.assigned) return;

        setAvailable((prev) => [...prev, role.assigned]);

        setRoles((prev) =>
            prev.map((r) =>
                r.id === role.id ? { ...r, assigned: null } : r
            )
        );
    };


    useEffect(() => {
        if (timeLeft === 0) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8, // 👈 drag starts only after moving 8px
          },
        })
      );

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
                            <div className="stat-value">0/6</div>
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
                                {roles.map((role) => (
                                    <DropRoleCard key={role.id} role={role} onCancel={handleCancel} />
                                ))}
                            </div>

                            {/* RIGHT */}
                            <div className="directors">
                                <h4>AVAILABLE DIRECTORS</h4>
                                <div className="directors-grid">
                                    {available.map((d) => (
                                        <DraggableDirector key={d.id} director={d} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ✅ DRAG OVERLAY */}
                        <DragOverlay>
                            {activeDirector ? (
                                <div className="drag-overlay">
                                    {activeDirector.name}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {/* INSTRUCTION */}
                    <p className="instruction">
                        Drag and drop director names onto the empty slots below each avatar
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
