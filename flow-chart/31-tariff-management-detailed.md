# 31 - Tariff Management Detailed Flowchart

```mermaid
flowchart TD
    StartTariffMgmt([Admin Navigates to Tariff Management]) --> LoadTariffList["GET /api/admin/tariffs"]

    LoadTariffList --> FetchTariffData["Backend Fetches Tariff Data"]
    FetchTariffData --> GroupByTariffType["Group by tariff type (RESIDENTIAL, COMMERCIAL)"]
    GroupByTariffType --> FetchActiveTariffs["Fetch currently active tariffs"]
    FetchActiveTariffs --> FetchHistoricalTariffs["Fetch historical tariff versions"]

    HistoricalTariffs --> ReturnTariffList["Return Tariff List DTO"]

    ReturnTariffList --> RenderTariffDashboard["Render Tariff Management Dashboard"]
    RenderTariffDashboard --> DisplayTariffTypes["Display Tariff Type Tabs: Residential, Commercial"]
    RenderTariffDashboard --> DisplayActiveTariffs["Display Active Tariff Configuration"]
    RenderTariffDashboard --> DisplayTariffHistory["Display Historical Tariff Versions"

    DisplayActiveTariffs --> TariffSlabDisplay["Display Tariff Slabs: Slab 1 (0-100 units), Slab 2 (101-300 units), Slab 3 (301+ units)"]
    TariffSlabDisplay --> TariffRatesDisplay["Display Rates: Energy Charge per unit, Fixed Charge per kW, Electricity Duty %"]
    TariffRatesDisplay --> TariffEffectiveDates["Display Effective Dates: effective_from, effective_to"]

    DisplayTariffHistory --> TariffHistoryTable["Table: Version, Effective From, Effective To, Rates, Created By, Created At"]

    TariffHistoryTable --> AdminTariffAction{"Admin Action"}
    AdminTariffAction -->|View Tariff Details| ViewTariffDetails["View detailed tariff configuration"]
    AdminTariffAction -->|Update Tariff| UpdateTariffForm["Navigate to update tariff form"]
    AdminTariffAction -->|Add New Tariff Version| AddNewTariffVersion["Create new tariff version"]
    AdminTariffAction -->|Activate Tariff| ActivateTariff["Activate specific tariff version"]

    %% View Tariff Details
    ViewTariffDetails --> FetchTariffDetails["GET /api/admin/tariffs/{id}"]
    FetchTariffDetails --> FetchTariffSlabs["Fetch tariff slab details"]
    FetchTariffSlabs --> FetchBillsUsingTariff["Fetch sample bills using this tariff"]
    FetchBillsUsingTariff --> RenderTariffDetailsModal["Render Tariff Details Modal"]

    RenderTariffDetailsModal --> TariffDetailsSections["Sections: Tariff Type, Slab Configuration, Rate Details, Effective Period, Usage Statistics, Impact Analysis"]
    TariffDetailsSections --> DisplayImpactAnalysis["Display impact analysis: 'This tariff affects X customers, average bill change: ±Y%'"]

    %% Update Tariff Flow
    UpdateTariffForm --> FetchCurrentTariff["GET /api/admin/tariffs/active/{type}"]
    FetchCurrentTariff --> DisplayUpdateTariffForm["Display Update Tariff Form with current values"]
    DisplayUpdateTariffForm --> ModifyTariffRates["Modify: Slab rates, Fixed charge, Duty percentage"]
    ModifyTariffRates --> SetEffectiveDate["Set effective_from date (default: next billing cycle start)"]
    SetEffectiveDate --> ValUpdateTariffForm{"Client-Side Validation"}
    ValUpdateTariffForm -->|Invalid| ErrUpdateTariffVal["Error: Invalid tariff rates or dates"]
    ErrUpdateTariffVal --> ModifyTariffRates

    ValUpdateTariffForm -->|Valid| PreviewTariffImpact["Preview tariff impact on sample customers"]
    PreviewTariffImpact --> CalculateImpact["Calculate average bill change for customer sample"]
    CalculateImpact --> DisplayImpactPreview["Display impact preview: 'Average bill change: +₹X (Y%)'"]

    DisplayImpactPreview --> ConfirmTariffUpdate{"Confirm tariff update?"}
    ConfirmTariffUpdate -->|No| CancelUpdate["Cancel update"]
    CancelUpdate --> RenderTariffDashboard

    ConfirmTariffUpdate -->|Yes| SubmitUpdateTariffAPI["PUT /api/admin/tariffs/{id}"]
    SubmitUpdateTariffAPI --> BackendTariffVal{"Backend Validation"}
    BackendTariffVal -->|Invalid| ErrBackendTariffVal["400 Bad Request: Invalid tariff configuration"]
    ErrBackendTariffVal --> ModifyTariffRates

    BackendTariffVal -->|Valid| CreateTariffVersion["Create new tariff version (version_number incremented)"]
    CreateTariffVersion --> SaveTariffSlabs["Save tariff slab configuration"]
    SaveTariffSlabs --> LogTariffUpdate["Log tariff update in audit_logs (admin_id, old_rates, new_rates)"]
    LogTariffUpdate --> ReturnUpdateTariffSuccess["Return 200 OK"]
    ReturnUpdateTariffSuccess --> DisplayUpdateTariffSuccess["Display success: 'Tariff updated successfully. New rates effective from {date}'"]

    %% Add New Tariff Version Flow
    AddNewTariffVersion --> DisplayAddTariffForm["Display Add New Tariff Form"]
    DisplayAddTariffForm --> SelectTariffType["Select tariff type (RESIDENTIAL/COMMERCIAL)"]
    SelectTariffType --> ConfigureSlabs["Configure tariff slabs (min 1 slab, max 5 slabs)"]
    ConfigureSlabs --> InputSlabRanges["Input slab ranges (units) and rates per unit"]
    InputSlabRanges --> InputFixedCharge["Input fixed charge per kW"]
    InputFixedCharge --> InputDutyPercentage["Input electricity duty percentage"]
    InputDutyPercentage --> SetEffectiveFrom["Set effective_from date"]
    SetEffectiveFrom --> ValAddTariffForm{"Client-Side Validation"}

    ValAddTariffForm -->|Invalid| ErrAddTariffVal["Error: Invalid tariff configuration"]
    ErrAddTariffVal --> ConfigureSlabs

    ValAddTariffForm -->|Valid| SubmitAddTariffAPI["POST /api/admin/tariffs"]
    SubmitAddTariffAPI --> BackendAddTariffVal{"Backend Validation"}
    BackendAddTariffVal -->|Invalid| ErrBackendAddTariffVal["400 Bad Request: Invalid tariff configuration"]
    ErrBackendAddTariffVal --> ConfigureSlabs

    BackendAddTariffVal -->|Valid| CreateNewTariffRecord["INSERT tariff record (status = DRAFT)"]
    CreateNewTariffRecord --> SaveNewTariffSlabs["Save tariff slab configuration"]
    SaveNewTariffSlabs --> LogTariffCreation["Log tariff creation in audit_logs"]
    LogTariffCreation --> ReturnAddTariffSuccess["Return 201 Created"]
    ReturnAddTariffSuccess --> DisplayAddTariffSuccess["Display success: 'New tariff version created. Activate to apply rates.'"]

    %% Activate Tariff Flow
    ActivateTariff --> SelectTariffToActivate["Select tariff version to activate"]
    SelectTariffToActivate --> DisplayActivateModal["Display Activation Confirmation Modal"]
    DisplayActivateModal --> CheckCurrentActive{"Check currently active tariff"}
    CheckCurrentActive -->|Has Active Tariff| DeactivateOldTariff["Deactivate current active tariff (set effective_to = NOW)"]
    CheckCurrentActive -->|No Active Tariff| ActivateNewTariff

    DeactivateOldTariff --> LogTariffDeactivation["Log tariff deactivation in audit_logs"]
    LogTariffDeactivation --> ActivateNewTariff["Activate new tariff (set status = ACTIVE, effective_from = NOW)"]
    ActivateNewTariff --> SubmitActivateTariffAPI["PUT /api/admin/tariffs/{id}/activate"]

    SubmitActivateTariffAPI --> UpdateTariffStatus["UPDATE tariff status = ACTIVE"]
    UpdateTariffStatus --> SetEffectiveDates["Set effective_from = NOW, effective_to = NULL"]
    SetEffectiveDates --> LogTariffActivation["Log tariff activation in audit_logs"]
    LogTariffActivation --> NotifyTariffChange["Notify admin: 'Tariff {type} activated. New rates now effective for all new bill generation.'"]
    NotifyTariffChange --> ReturnActivateTariffSuccess["Return 200 OK"]
    ReturnActivateTariffSuccess --> DisplayActivateTariffSuccess["Display success: 'Tariff activated successfully'"]
```
