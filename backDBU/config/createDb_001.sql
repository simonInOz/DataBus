
if(NOT exists(select *
from sys.objects
WHERE type_desc='USER_TABLE' AND NAME='Action'))
BEGIN
	print 'Create Action table'

	SET ANSI_NULLS ON
	SET QUOTED_IDENTIFIER ON
	CREATE TABLE [dbo].[Action]
	(
		[id] [int] IDENTITY(1,1) NOT NULL,
		[name] [varchar](255) NULL,
		[operation] [varchar](255) NULL,
		[Date] [datetime] NULL
	) ON [PRIMARY]
	ALTER TABLE [dbo].[Action] ADD PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END

if(NOT exists(select *
from sys.objects
WHERE type_desc='USER_TABLE' AND NAME='Audit'))
BEGIN
	print 'Create Audit table'

	SET ANSI_NULLS ON
	SET QUOTED_IDENTIFIER ON
	CREATE TABLE [dbo].[Audit]
	(
		[id] [int] IDENTITY(1,1) NOT NULL,
		[operation] [varchar](255) NULL,
		[userName] [varchar](255) NULL,
		[email] [varchar](255) NULL,
		[ip] [varchar](16) NULL,
		[groups] [varchar](8000) NULL,
		[errCode] [varchar](255) NULL,
		[errMsg] [varchar](8000) NULL,
		[Date] [datetime] NULL
	) ON [PRIMARY]
	ALTER TABLE [dbo].[Audit] ADD PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END

if(NOT exists(select *
from sys.objects
WHERE type_desc='USER_TABLE' AND NAME='Logins'))
BEGIN
	print 'Create login table'

	SET ANSI_NULLS ON
	SET QUOTED_IDENTIFIER ON
	CREATE TABLE [dbo].[Logins]
	(
		[id] [int] IDENTITY(1,1) NOT NULL,
		[operation] [varchar](255) NULL,
		[userName] [varchar](255) NULL,
		[email] [varchar](255) NULL,
		[ip] [varchar](16) NULL,
		[groups] [varchar](8000) NULL,
		[errCode] [varchar](255) NULL,
		[errMsg] [varchar](8000) NULL,
		[Date] [datetime] NULL,
		[jwt] [varchar](8000) NULL
	) ON [PRIMARY]
	ALTER TABLE [dbo].[Logins] ADD PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END


if(NOT exists(select *
from sys.objects
WHERE type_desc='USER_TABLE' AND NAME='upload_errors'))
BEGIN
	print 'Create upload_errors'
	SET ANSI_NULLS ON
	SET QUOTED_IDENTIFIER ON
	CREATE TABLE [dbo].[upload_errors]
	(
		[id] [int] IDENTITY(1,1) NOT NULL,
		[user_id] [varchar](255) NULL,
		[originalFilename] [varchar](255) NULL,
		[code] [varchar](255) NULL,
		[msg] [varchar](255) NULL,
		[createdAt] [datetime] NULL,
		[uploads_ID] [varchar](255) NULL,
		[error_level] [varchar](255) NULL,
		[addr] [varchar](255) NULL
	) ON [PRIMARY]
	ALTER TABLE [dbo].[upload_errors] ADD PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END

if(NOT exists(select *
from sys.objects
WHERE type_desc='USER_TABLE' AND NAME='uploads'))
BEGIN
	print 'Create uploads'
	SET ANSI_NULLS ON
	SET QUOTED_IDENTIFIER ON
	CREATE TABLE [dbo].[uploads]
	(
		[id] [int] IDENTITY(1,1) NOT NULL,
		[user_ID] [varchar](50) NULL,
		[user_Email] [varchar](50) NULL,
		[user_Mnemonic] [varchar](50) NULL,
		[user_FI_ID] [varchar](50) NULL,
		[FI_ID] [varchar](50) NULL,
		[ReportPeriod_ID] [varchar](50) NULL,
		[Framework] [varchar](50) NULL,
		[Form] [varchar](255) NULL,
		[Data_Provided] [varchar](255) NULL,
		[refName] [varchar](255) NULL,
		[refFile] [varchar](255) NULL,
		[refFileId] [int] NULL,
		[originalFilename] [varchar](255) NULL,
		[filename] [varchar](255) NULL,
		[createdAt] [datetime] NULL,
		[approved] [bit] NOT NULL,
		[comment] [varchar](8000) NULL,
		[overwritten] [smalldatetime] NULL,
		[overwrittenBy] [int] NULL,
		[deleted] [smalldatetime] NULL,
		[uploaded_file] [varbinary](max) NULL
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
	ALTER TABLE [dbo].[uploads] ADD  DEFAULT (NULL) FOR [user_ID]
	ALTER TABLE [dbo].[uploads] ADD  DEFAULT (NULL) FOR [user_email]
END


if(NOT exists(select *
from sys.objects
WHERE type_desc='USER_TABLE' AND NAME='Banner'))
BEGIN
	print 'Create Banner table'
	SET ANSI_NULLS ON
	SET QUOTED_IDENTIFIER ON
	CREATE TABLE [dbo].[Banner]
	(
		[id] [int] IDENTITY(1,1) NOT NULL,
		[bannerType] [varchar](255) NULL,
		[message] [varchar](8000) NULL,
		[durationSecs] [int] NULL
	) ON [PRIMARY]

	ALTER TABLE [dbo].[Banner] ADD PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
END
