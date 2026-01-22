import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

import SubmitTimesheet from "./SubmitTimesheetModal";
import TimesheetStatusTable from "./TimesheetStatusTable";
import MonthYearFilter from "./MonthYearFilter";
import EditTimesheetModal from "./EditTimesheetModal";
import InvoiceStatusTable from "./InvoiceStatusTable";
import CreateInvoiceModal from "./CreateInvoiceModal";

import { getAccessToken } from "../../auth/authService";
import {
  getEmployeeHierarchy,
  getTimesheetsForMonth,
  deleteTimesheetRecord,
  getClients,
  getInvoicesByMonthYear,
  updateInvoiceStatus,
} from "../../services/sharePointService";

import "./HRDashboard.css";

export default function HRDashboard() {
  const { instance, accounts } = useMsal();

  const [showSubmitTimesheet, setShowSubmitTimesheet] = useState(false);
  const [employees, setEmployees] = useState([]);
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
      getTimesheetsForMonth(token, month, year),
      getClients(token),
    ])
      .then(([hierarchy, ts, clientData]) => {
        console.log(hierarchy);
        console.log(ts);
        console.log(clientData);
        setEmployees(
          Array.isArray(hierarchy) ? hierarchy : hierarchy?.value || [],
        );
        setTimesheets(Array.isArray(ts) ? ts : ts?.value || []);
        setClients(
          Array.isArray(clientData) ? clientData : clientData?.value || [],
        );
      })
      .catch((error) => {
        console.error("Failed to load SharePoint data:", error);
        setEmployees([]);
        setTimesheets([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, month, year]);

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

  const handleClientVerified = async (invoice) => {
    await updateInvoiceStatus(token, invoice.ID, {
      InvoiceStatus: "Client Verified",
    });
    refreshInvoices();
  };

  useEffect(() => {
    console.log("showCreateInvoice =", showCreateInvoice);
  }, [showCreateInvoice]);

  async function handleDeleteTimesheet(timesheet) {
    if (!timesheet || !timesheet.Id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this timesheet?",
    );

    if (!confirmed) return;

    try {
      await deleteTimesheetRecord(token, timesheet.Id);

      // Reload timesheets after delete
      const updatedTimesheets = await getTimesheetsForMonth(token, month, year);

      setTimesheets(
        Array.isArray(updatedTimesheets)
          ? updatedTimesheets
          : updatedTimesheets?.value || [],
      );
    } catch (error) {
      console.error("Failed to delete timesheet:", error);
      alert("Failed to delete timesheet record.");
    }
  }

  /* ============================
     3️⃣ Render (NO EARLY RETURN)
     ============================ */
  return (
    <>
      <div className="manager-dashboard">
        {/* ✅ MONTH / YEAR FILTER — ALWAYS VISIBLE */}
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
                  employees={employees}
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
                {/* Invoices Section */}

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
                  onCreateInvoice={() => {
                    console.log("HRDashboard received create invoice click");
                    setShowCreateInvoice(true);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
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
            setTimesheets(Array.isArray(ts) ? ts : ts?.value || []);
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
    </>
  );
}
