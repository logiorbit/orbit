import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
//import { updateLeaveStatus } from "../../services/sharePointService";
import {
  updateLeaveStatus,
  finalizeLeaveApproval,
} from "../../services/sharePointService";

export default function ManagerActionModal({ leave, onClose, onSuccess }) {
  const { instance, accounts } = useMsal();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const act = async (status) => {
    if (!comment) {
      alert("Comment is mandatory");
      return;
    }

    setLoading(true);
    const token = await getAccessToken(instance, accounts[0]);

    if (status == "Approved") {
      await finalizeLeaveApproval(token, {
        ...leave,
        LeaveType: leave.LeaveType,
        Employee: leave.Employee,
      });
    }

    await updateLeaveStatus(token, leave.Id, {
      Status: status,
      ManagerComment: comment,
    });

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card premium-modal">
        {/* Header */}
        <div className="modal-header">
          <h3>Manager Review</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="review-grid">
            <div className="review-item">
              <span>Employee</span>
              <strong>{leave.Employee.Title}</strong>
            </div>

            <div className="review-item">
              <span>Leave Dates</span>
              <strong>
                {new Date(leave.StartDate).toLocaleDateString("en-GB")} →{" "}
                {new Date(leave.EndDate).toLocaleDateString("en-GB")}
              </strong>
            </div>

            <div className="review-item">
              <span>Leave Type</span>
              <strong>{leave.LeaveType.Title}</strong>
            </div>

            <div className="review-item">
              <span>No. of Days</span>
              <strong>{leave.NoofDays}</strong>
            </div>

            <div className="review-item full-width">
              <span>Reason</span>
              <strong>{leave.Reason}</strong>
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: 18 }}>
            <label>Manager Comment</label>
            <textarea
              rows="3"
              placeholder="Enter approval / rejection comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={() => act("Rejected")}
            disabled={loading}
          >
            Reject
          </button>

          <button
            className="btn-primary"
            onClick={() => act("Approved")}
            disabled={loading}
          >
            {loading ? "Processing..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
