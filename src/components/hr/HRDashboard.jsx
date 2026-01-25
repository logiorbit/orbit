import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";

import SubmitTimesheet from "./SubmitTimesheetModal";
import TimesheetStatusTable from "./TimesheetStatusTable";
import MonthYearFilter from "./MonthYearFilter";
import EditTimesheetModal from "./EditTimesheetModal";
import InvoiceStatusTable from "./InvoiceStatusTable";
import CreateInvoiceModal from "./CreateInvoiceModal";
import PdfViewerModal from "../common/PdfViewerModal";

import {
  markInvoiceSent,
  markInvoicePaid,
} from "../../services/sharePointService";

import { getAccessToken } from "../../auth/authService";
import {
  getEmployeeHierarchy,
  getTimesheetsForMonth,
  deleteTimesheetRecord,
  getClients,
  getInvoicesByMonthYear,
  updateInvoiceStatus,
  getEmployeeClientAssignments, // ✅ NEW (already in service)
} from "../../services/sharePointService";

import "./HRDashboard.css";

export default function HRDashboard() {
  const { instance, accounts } = useMsal();
  const { userRoles } = useUserContext();

  const [showSubmitTimesheet, setShowSubmitTimesheet] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]); // ✅ NEW
  const [timesheets, setTimesheets] = useState([]);
  const [month, setMonth] = useState("Jan");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [pdfToView, setPdfToView] = useState(null);

  /* ============================
     1️⃣ Acquire Access Token
     ============================ */
  useEffect(() => {
    if (!accounts || accounts.length === 0) return;

    getAccessToken(instance, accounts[0])
      .then(setToken)
      .catch((err) => {
        console.error("Failed to acquire token:", err);
        setToken(null);
      });
  }, [instance, accounts]);

  /* ============================
     2️⃣ Load SharePoint Data
     ============================ */
  useEffect(() => {
    if (!token) return;

    setLoading(true);

    Promise.all([
      getEmployeeHierarchy(token),
      getEmployeeClientAssignments(token), // ✅ NEW SOURCE OF TRUTH
      getTimesheetsForMonth(token, month, year),
      getClients(token),
    ])
      .then(([hierarchy, assignmentData, ts, clientData]) => {
        setEmployees(Array.isArray(hierarchy) ? hierarchy : []);
        setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
        setTimesheets(Array.isArray(ts) ? ts : []);
        setClients(Array.isArray(clientData) ? clientData : []);
      })
      .catch((error) => {
        console.error("Failed to load SharePoint data:", error);
        setEmployees([]);
        setAssignments([]);
        setTimesheets([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, month, year]);

  /* ============================
     Invoices
     ============================ */
  useEffect(() => {
    if (!token || !month || !year) return;

    async function fetchInvoices() {
      setLoadingInvoices(true);
      try {
        const data = await getInvoicesByMonthYear(token, month, year);
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices", error);
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    }

    fetchInvoices();
  }, [token, month, year]);

  async function handleDeleteTimesheet(timesheet) {
    if (!timesheet || !timesheet.Id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this timesheet?",
    );
    if (!confirmed) return;

    try {
      await deleteTimesheetRecord(token, timesheet.Id);
      const updated = await getTimesheetsForMonth(token, month, year);
      setTimesheets(Array.isArray(updated) ? updated : []);
    } catch (error) {
      console.error("Failed to delete timesheet:", error);
      alert("Failed to delete timesheet record.");
    }
  }

  /* ============================
     Invoice Actions (UNCHANGED)
     ============================ */
  const refreshInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const data = await getInvoicesByMonthYear(token, month, year);
      setInvoices(data);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleHRApprove = async (invoice) => {
    await updateInvoiceStatus(token, invoice.ID, {
      InvoiceStatus: "HR Approved",
      ApprovedOnHR: new Date().toISOString(),
      ApprovedByHR: currentUser.Id,
    });
    refreshInvoices();
  };

  const handleHODApprove = async (invoice) => {
    await updateInvoiceStatus(token, invoice.ID, {
      InvoiceStatus: "HOD Approved",
      IsLocked: true,
      ApprovedOnHOD: new Date().toISOString(),
      ApprovedByHOD: currentUser.Id,
    });
    refreshInvoices();
  };

  const handleClientVerified = async (invoice) => {
    await updateInvoiceStatus(token, invoice.ID, {
      InvoiceStatus: "Client Verified",
      IsLocked: true,
      LockReason: "Client has verified the PDF",
    });
    refreshInvoices();
  };

  const handleGenerateEInvoice = async (invoice) => {
    await updateInvoiceStatus(token, invoice.ID, {
      InvoiceStatus: "EInvoice",
    });
    refreshInvoices();
  };

  const handleMarkSent = async (invoice) => {
    await markInvoiceSent(token, invoice.ID);
    refreshInvoices();
  };

  const handleMarkPaid = async (invoice) => {
    const ref = window.prompt("Enter payment reference / UTR:");
    if (!ref) return;
    await markInvoicePaid(token, invoice.ID, ref);
    refreshInvoices();
  };

  /* ============================
     Render
     ============================ */
  return (
    <>
      <div className="manager-dashboard">
        <MonthYearFilter
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />

        {loading ? (
          <div className="hr-card">Loading Timesheet Status…</div>
        ) : (
          <>
            <div className="btn-div">
              <button
                className="primary-btn"
                onClick={() => setShowSubmitTimesheet(true)}
              >
                + Submit Timesheet
              </button>
            </div>

            <div className="manager-grid-1">
              <div className="card">
                <TimesheetStatusTable
                  assignments={assignments} // ✅ NEW
                  timesheets={timesheets}
                  month={month}
                  year={year}
                  onEdit={(ts) => setEditingTimesheet(ts)}
                  onDelete={handleDeleteTimesheet}
                />
              </div>
            </div>

            <div className="manager-grid-1">
              <div className="card">
                <InvoiceStatusTable
                  invoices={invoices}
                  loading={loadingInvoices}
                  month={month}
                  year={year}
                  userRole="HR"
                  onApproveByHR={handleHRApprove}
                  onApproveByHOD={handleHODApprove}
                  onClientVerified={handleClientVerified}
                  onGenerateEInvoice={handleGenerateEInvoice}
                  onViewPdf={(url) => setPdfToView(url)}
                  onMarkSent={handleMarkSent}
                  onMarkPaid={handleMarkPaid}
                  onCreateInvoice={() => setShowCreateInvoice(true)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {showSubmitTimesheet && (
        <SubmitTimesheet onClose={() => setShowSubmitTimesheet(false)} />
      )}

      {editingTimesheet && (
        <EditTimesheetModal
          token={token}
          timesheet={editingTimesheet}
          clients={clients}
          onClose={() => setEditingTimesheet(null)}
          onSaved={async () => {
            const ts = await getTimesheetsForMonth(token, month, year);
            setTimesheets(Array.isArray(ts) ? ts : []);
          }}
        />
      )}

      {showCreateInvoice && (
        <CreateInvoiceModal
          clients={clients}
          token={token}
          month={month}
          year={year}
          onClose={() => setShowCreateInvoice(false)}
        />
      )}

      {pdfToView && (
        <PdfViewerModal pdfUrl={pdfToView} onClose={() => setPdfToView(null)} />
      )}
    </>
  );
}
