# Event Storming: Assessment Application Flow

Diagram ini menggambarkan alur aplikasi assessment yang melibatkan 3 aktor: **Admin**, **Peserta (Assessee)**, dan **Asesor (Assessor)**.

## Legenda Warna (Event Storming Standard)
- **Biru (Command):** Aksi/Perintah yang dilakukan user (contoh: "Submit Jawaban").
- **Oranye (Event):** Fakta yang terjadi setelah command berhasil (contoh: "Jawaban Terkirim").
- **Pink (Policy):** Aturan bisnis atau logika otomatis (contoh: "Jika nilai < 70, gagal").
- **Hijau (Read Model/View):** Informasi yang dilihat user untuk mengambil keputusan.

```mermaid
flowchart TD
    %% --- DEFINISI STYLE (Warna sesuai standar Event Storming) ---
    classDef command fill:#5D8AA8,stroke:#333,stroke-width:2px,color:white,rx:5,ry:5;
    classDef event fill:#FFBF00,stroke:#333,stroke-width:2px,color:black,shape:parallelogram;
    classDef policy fill:#FFB6C1,stroke:#333,stroke-width:2px,color:black,stroke-dasharray: 5 5;
    classDef view fill:#90EE90,stroke:#333,stroke-width:2px,color:black,shape:rect;
    classDef actor fill:#f9f9f9,stroke:#333,stroke-width:1px,color:black,shape:circle;

    %% --- MULAI DIAGRAM ---

    %% JALUR ADMIN (INISIASI)
    subgraph Admin_Area [Area Admin]
        direction TB
        View_Config(Project\nConfiguration):::view
        Cmd_Setup(Setup\nProject):::command
        Evt_Init(Project\nInitiated):::event
        Cmd_Invite(Send\nInvitation):::command
        Evt_Invited(Invitation\nSent):::event
        
        %% Policy
        Pol_Quota(Policy:\nMax 100 User/Batch):::policy
        
        %% Monitoring View
        View_Dashboard(Monitoring\nDashboard):::view
    end

    %% JALUR PESERTA (PENGERJAAN)
    subgraph Peserta_Area [Area Peserta / Assessee]
        direction TB
        Evt_Received(Invitation\nReceived):::event
        Cmd_Start(Start\nAssessment):::command
        Evt_Started(Assessment\nStarted):::event
        Cmd_Submit(Submit\nAnswers):::command
        Evt_Submitted(Answers\nSubmitted):::event
        
        %% Policy
        Pol_Time(Policy:\nAuto-submit if\ntime expired):::policy
    end

    %% JALUR ASESOR (PENILAIAN)
    subgraph Asesor_Area [Area Asesor / Assessor]
        direction TB
        View_NeedsGrade(Pending\nSubmission List):::view
        Cmd_Grade(Grade\nAnswers):::command
        Evt_Graded(Grading\nCompleted):::event
        Cmd_Finalize(Finalize\nReport):::command
        Evt_ReportReady(Standardized\nReport Generated):::event
    end

    %% --- RELASI ANTAR NODE ---

    %% Flow Admin
    View_Config --> Cmd_Setup
    Pol_Quota -.-> Cmd_Setup
    Cmd_Setup --> Evt_Init
    Evt_Init --> Cmd_Invite
    Cmd_Invite --> Evt_Invited

    %% Flow Admin ke Peserta
    Evt_Invited --> Evt_Received

    %% Flow Peserta
    Evt_Received --> Cmd_Start
    Cmd_Start --> Evt_Started
    Evt_Started --> Pol_Time
    Pol_Time -.-> Cmd_Submit
    Evt_Started --> Cmd_Submit
    Cmd_Submit --> Evt_Submitted

    %% Flow Peserta ke Asesor
    Evt_Submitted --> View_NeedsGrade
    
    %% Flow Asesor
    View_NeedsGrade --> Cmd_Grade
    Cmd_Grade --> Evt_Graded
    Evt_Graded --> Cmd_Finalize
    Cmd_Finalize --> Evt_ReportReady

    %% Feedback Loop ke Admin (Monitoring)
    Evt_ReportReady --> View_Dashboard
    Evt_Submitted -.-> View_Dashboard

```
