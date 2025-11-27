--
-- PostgreSQL database dump
--

\restrict C9HG0L2eXUoKwnIN9w2So1Yy4O80Z2kdlGSebVXf6lKXG9bqe4NLvodN4TbUGfd

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7 (Debian 17.7-3.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: User_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_userid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_userid_seq" OWNER TO postgres;

--
-- Name: User_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_userid_seq" OWNED BY public.users.userid;


--
-- Name: action_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_permissions (
    actionid integer NOT NULL,
    actionname character varying(100) NOT NULL
);


ALTER TABLE public.action_permissions OWNER TO postgres;

--
-- Name: action_permissions_actionid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_permissions_actionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.action_permissions_actionid_seq OWNER TO postgres;

--
-- Name: action_permissions_actionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_permissions_actionid_seq OWNED BY public.action_permissions.actionid;


--
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    companyid integer NOT NULL,
    companyname character varying(100),
    companyroomid integer
);


ALTER TABLE public.company OWNER TO postgres;

--
-- Name: company_companyid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_companyid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_companyid_seq OWNER TO postgres;

--
-- Name: company_companyid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_companyid_seq OWNED BY public.company.companyid;


--
-- Name: companyrooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companyrooms (
    companyroomid integer NOT NULL,
    companyroomname character varying(100),
    companyroomtype character varying(50),
    companyroomdepartment character varying(100)
);


ALTER TABLE public.companyrooms OWNER TO postgres;

--
-- Name: companyrooms_companyroomid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companyrooms_companyroomid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companyrooms_companyroomid_seq OWNER TO postgres;

--
-- Name: companyrooms_companyroomid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companyrooms_companyroomid_seq OWNED BY public.companyrooms.companyroomid;


--
-- Name: cv; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cv (
    cvid integer NOT NULL,
    cvsenderinfo character varying(100),
    cvdate timestamp without time zone,
    cvitself bytea,
    cvscore integer,
    jobpostid integer
);


ALTER TABLE public.cv OWNER TO postgres;

--
-- Name: cv_cvid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cv_cvid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cv_cvid_seq OWNER TO postgres;

--
-- Name: cv_cvid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cv_cvid_seq OWNED BY public.cv.cvid;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    departmentid integer NOT NULL,
    departmentname character varying(100)
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_departmentid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_departmentid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_departmentid_seq OWNER TO postgres;

--
-- Name: departments_departmentid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_departmentid_seq OWNED BY public.departments.departmentid;


--
-- Name: jobposts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobposts (
    jobpostid integer NOT NULL,
    expectations character varying,
    departmentid integer,
    companyid integer,
    createdbyuser integer
);


ALTER TABLE public.jobposts OWNER TO postgres;

--
-- Name: jobpost_jobpostid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobpost_jobpostid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobpost_jobpostid_seq OWNER TO postgres;

--
-- Name: jobpost_jobpostid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobpost_jobpostid_seq OWNED BY public.jobposts.jobpostid;


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meetings (
    meetingid integer NOT NULL,
    companyroomid integer,
    meetingdate timestamp without time zone,
    meetingsubject character varying(255),
    isempty boolean
);


ALTER TABLE public.meetings OWNER TO postgres;

--
-- Name: meetings_meetingid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meetings_meetingid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meetings_meetingid_seq OWNER TO postgres;

--
-- Name: meetings_meetingid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meetings_meetingid_seq OWNED BY public.meetings.meetingid;


--
-- Name: menu_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_permissions (
    menuid integer NOT NULL,
    menuname character varying(100) NOT NULL
);


ALTER TABLE public.menu_permissions OWNER TO postgres;

--
-- Name: menu_permissions_menuid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_permissions_menuid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_permissions_menuid_seq OWNER TO postgres;

--
-- Name: menu_permissions_menuid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_permissions_menuid_seq OWNED BY public.menu_permissions.menuid;


--
-- Name: positionnames; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positionnames (
    id integer NOT NULL,
    position_name character varying(100) NOT NULL,
    description text,
    level character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.positionnames OWNER TO postgres;

--
-- Name: positionnames_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positionnames_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positionnames_id_seq OWNER TO postgres;

--
-- Name: positionnames_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positionnames_id_seq OWNED BY public.positionnames.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    position_name_id integer NOT NULL,
    departmentid integer NOT NULL,
    quota integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request (
    requestid integer NOT NULL,
    senderuserid integer,
    recieveruserid integer,
    requesttypeid integer
);


ALTER TABLE public.request OWNER TO postgres;

--
-- Name: request_requestid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_requestid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_requestid_seq OWNER TO postgres;

--
-- Name: request_requestid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_requestid_seq OWNED BY public.request.requestid;


--
-- Name: requesttype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requesttype (
    requesttypeid integer NOT NULL,
    requesttypename character varying(100)
);


ALTER TABLE public.requesttype OWNER TO postgres;

--
-- Name: requesttype_requesttypeid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.requesttype_requesttypeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.requesttype_requesttypeid_seq OWNER TO postgres;

--
-- Name: requesttype_requesttypeid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.requesttype_requesttypeid_seq OWNED BY public.requesttype.requesttypeid;


--
-- Name: role_action_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_action_permissions (
    roleid integer NOT NULL,
    actionid integer NOT NULL
);


ALTER TABLE public.role_action_permissions OWNER TO postgres;

--
-- Name: role_menu_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_menu_permissions (
    roleid integer NOT NULL,
    menuid integer NOT NULL
);


ALTER TABLE public.role_menu_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    roleid integer NOT NULL,
    rolename character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_roleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_roleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_roleid_seq OWNER TO postgres;

--
-- Name: roles_roleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_roleid_seq OWNED BY public.roles.roleid;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    userid integer NOT NULL,
    roleid integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: userdetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.userdetails (
    userdetailsid integer NOT NULL,
    userid integer,
    name character varying(100),
    departmentid integer,
    companyid integer,
    usersalary numeric(18,2),
    yearsworked integer,
    positionnames_id integer
);


ALTER TABLE public.userdetails OWNER TO postgres;

--
-- Name: userdetails_userdetailsid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.userdetails_userdetailsid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.userdetails_userdetailsid_seq OWNER TO postgres;

--
-- Name: userdetails_userdetailsid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.userdetails_userdetailsid_seq OWNED BY public.userdetails.userdetailsid;


--
-- Name: action_permissions actionid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_permissions ALTER COLUMN actionid SET DEFAULT nextval('public.action_permissions_actionid_seq'::regclass);


--
-- Name: company companyid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company ALTER COLUMN companyid SET DEFAULT nextval('public.company_companyid_seq'::regclass);


--
-- Name: companyrooms companyroomid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companyrooms ALTER COLUMN companyroomid SET DEFAULT nextval('public.companyrooms_companyroomid_seq'::regclass);


--
-- Name: cv cvid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cv ALTER COLUMN cvid SET DEFAULT nextval('public.cv_cvid_seq'::regclass);


--
-- Name: departments departmentid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN departmentid SET DEFAULT nextval('public.departments_departmentid_seq'::regclass);


--
-- Name: jobposts jobpostid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobposts ALTER COLUMN jobpostid SET DEFAULT nextval('public.jobpost_jobpostid_seq'::regclass);


--
-- Name: meetings meetingid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings ALTER COLUMN meetingid SET DEFAULT nextval('public.meetings_meetingid_seq'::regclass);


--
-- Name: menu_permissions menuid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_permissions ALTER COLUMN menuid SET DEFAULT nextval('public.menu_permissions_menuid_seq'::regclass);


--
-- Name: positionnames id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positionnames ALTER COLUMN id SET DEFAULT nextval('public.positionnames_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: request requestid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request ALTER COLUMN requestid SET DEFAULT nextval('public.request_requestid_seq'::regclass);


--
-- Name: requesttype requesttypeid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requesttype ALTER COLUMN requesttypeid SET DEFAULT nextval('public.requesttype_requesttypeid_seq'::regclass);


--
-- Name: roles roleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN roleid SET DEFAULT nextval('public.roles_roleid_seq'::regclass);


--
-- Name: userdetails userdetailsid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userdetails ALTER COLUMN userdetailsid SET DEFAULT nextval('public.userdetails_userdetailsid_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public."User_userid_seq"'::regclass);


--
-- Data for Name: action_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_permissions (actionid, actionname) FROM stdin;
1	kullanici_ekle
2	kullanici_sil
3	kullanici_duzenle
4	toplanti_olustur
5	toplanti_sil
6	maas_goruntule
7	maas_duzenle
8	cv_goruntule
9	cv_sil
10	talep_olustur
11	talep_onayla
\.


--
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company (companyid, companyname, companyroomid) FROM stdin;
1	Yıldız Teknoloji	1
2	Bulut Bilişim A.Ş.	2
\.


--
-- Data for Name: companyrooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companyrooms (companyroomid, companyroomname, companyroomtype, companyroomdepartment) FROM stdin;
1	Toplantı Odası A	Meeting	General
2	Yazılım Labı	Workspace	IT
3	Dinlenme Odası	Lounge	HR
\.


--
-- Data for Name: cv; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cv (cvid, cvsenderinfo, cvdate, cvitself, cvscore, jobpostid) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (departmentid, departmentname) FROM stdin;
1	IT Departmanı
2	İnsan Kaynakları
3	Frontend Development
4	Backend Development
6	Muhasebe Departmanı
5	QA/Test Departmanı
7	Yönetim Departmanı
\.


--
-- Data for Name: jobposts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobposts (jobpostid, expectations, departmentid, companyid, createdbyuser) FROM stdin;
1	- İleri Seviye Java\n- Etkili İletişim\n- 3+ yıl sektör deneyimi	1	\N	\N
2	İletişim kabiliyeti yüksek\nİleri seviye ingilizce bilen	1	\N	\N
3	falna filan	3	\N	\N
4	kjnjkkj	5	\N	\N
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meetings (meetingid, companyroomid, meetingdate, meetingsubject, isempty) FROM stdin;
1	1	2024-11-25 14:00:00	Haftalık Sprint Toplantısı	f
2	2	2024-11-26 10:00:00	Stajyer Oryantasyonu	f
\.


--
-- Data for Name: menu_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_permissions (menuid, menuname) FROM stdin;
1	menu_dashboard
2	menu_calisanlar
3	menu_ekibim
4	menu_toplanti
5	menu_maas
6	menu_cv
7	menu_talepler
8	menu_projeler
\.


--
-- Data for Name: positionnames; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positionnames (id, position_name, description, level, is_active, created_at, updated_at) FROM stdin;
1	Backend Developer	\N	Junior	t	2025-11-26 09:13:54.314838	2025-11-26 09:13:54.314838
2	Backend Developer	\N	Mid	t	2025-11-26 09:18:55.870945	2025-11-26 09:18:55.870945
3	Backend Developer	\N	Senior	t	2025-11-26 09:19:29.723868	2025-11-26 09:19:29.723868
4	Backend Developer	\N	Lead	t	2025-11-26 09:19:50.355926	2025-11-26 09:19:50.355926
5	Project Manager	Manages the department	Manager	t	2025-11-26 09:20:45.210938	2025-11-26 09:20:45.210938
6	Frontend Developer	\N	Junior	t	2025-11-26 09:21:16.283042	2025-11-26 09:21:16.283042
7	Frontend Developer	\N	Mid	t	2025-11-26 09:21:48.181754	2025-11-26 09:21:48.181754
8	Frontend Developer	\N	Senior	t	2025-11-26 09:22:10.948443	2025-11-26 09:22:10.948443
9	Frontend Developer	\N	Lead	t	2025-11-26 09:22:29.234558	2025-11-26 09:22:29.234558
10	DevOps Engineer	\N	Junior 	t	2025-11-26 20:08:49.200316	2025-11-26 20:08:49.200316
11	DevOps Engineer	\N	Mid	t	2025-11-26 20:09:47.326234	2025-11-26 20:09:47.326234
12	DevOps Engineer 	\N	Senior	t	2025-11-26 20:10:20.206543	2025-11-26 20:10:20.206543
13	Data Scientist	\N	Junior	t	2025-11-26 20:10:55.689811	2025-11-26 20:10:55.689811
14	Data Analyst	\N	Junior	t	2025-11-26 20:11:58.982086	2025-11-26 20:11:58.982086
15	QA Engineer	\N	Junior\n	t	2025-11-26 20:16:14.230716	2025-11-26 20:16:14.230716
16	QA Engineer	\N	Mid	t	2025-11-26 20:16:40.621398	2025-11-26 20:16:40.621398
17	QA Engineer	\N	Senior	t	2025-11-26 20:17:01.578414	2025-11-26 20:17:01.578414
18	QA Engineer	\N	Lead	t	2025-11-26 20:17:20.861125	2025-11-26 20:17:20.861125
19	CTO	\N	Manager	t	2025-11-26 20:17:45.125406	2025-11-26 20:17:45.125406
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, position_name_id, departmentid, quota, is_active, created_at, updated_at) FROM stdin;
1	1	4	1	t	2025-11-26 20:20:20.101851	2025-11-26 20:20:20.101851
2	2	4	1	t	2025-11-26 20:20:44.820485	2025-11-26 20:20:44.820485
3	3	4	1	t	2025-11-26 20:21:06.987593	2025-11-26 20:21:06.987593
4	4	4	1	t	2025-11-26 20:21:22.506305	2025-11-26 20:21:22.506305
5	5	4	1	t	2025-11-26 20:21:34.933348	2025-11-26 20:21:34.933348
6	6	3	1	t	2025-11-26 20:21:56.530087	2025-11-26 20:21:56.530087
7	7	3	1	t	2025-11-26 20:24:08.46831	2025-11-26 20:24:08.46831
8	8	3	1	t	2025-11-26 20:24:17.832414	2025-11-26 20:24:17.832414
9	9	3	1	t	2025-11-26 20:24:29.957814	2025-11-26 20:24:29.957814
10	10	1	1	t	2025-11-26 20:25:00.806527	2025-11-26 20:25:00.806527
11	11	1	1	t	2025-11-26 20:25:13.945172	2025-11-26 20:25:13.945172
12	12	1	1	t	2025-11-26 20:25:23.471915	2025-11-26 20:25:23.471915
13	13	1	1	t	2025-11-26 20:25:50.439624	2025-11-26 20:25:50.439624
14	14	1	1	t	2025-11-26 20:26:12.781069	2025-11-26 20:26:12.781069
15	15	5	1	t	2025-11-26 20:26:51.100715	2025-11-26 20:26:51.100715
16	16	5	1	t	2025-11-26 20:27:03.277762	2025-11-26 20:27:03.277762
17	17	5	1	t	2025-11-26 20:27:22.645196	2025-11-26 20:27:22.645196
18	18	5	1	t	2025-11-26 20:27:35.012942	2025-11-26 20:27:35.012942
19	19	7	1	t	2025-11-26 20:28:00.314595	2025-11-26 20:28:00.314595
20	5	3	1	t	2025-11-26 20:28:28.106331	2025-11-26 20:28:28.106331
21	5	1	1	t	2025-11-26 20:28:55.900883	2025-11-26 20:28:55.900883
\.


--
-- Data for Name: request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request (requestid, senderuserid, recieveruserid, requesttypeid) FROM stdin;
1	1	2	1
2	3	1	2
\.


--
-- Data for Name: requesttype; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requesttype (requesttypeid, requesttypename) FROM stdin;
1	İzin Talebi
2	Ekipman Talebi
3	Toplantı Ayarlama
\.


--
-- Data for Name: role_action_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_action_permissions (roleid, actionid) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
2	1
2	2
2	3
2	8
2	9
2	11
3	3
3	4
3	6
3	11
4	10
\.


--
-- Data for Name: role_menu_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_menu_permissions (roleid, menuid) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
2	1
2	2
2	6
2	7
3	1
3	3
3	4
3	7
4	1
4	7
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (roleid, rolename) FROM stdin;
1	Admin
2	İK
3	Yönetici
4	Çalışan
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (userid, roleid) FROM stdin;
\.


--
-- Data for Name: userdetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userdetails (userdetailsid, userid, name, departmentid, companyid, usersalary, yearsworked, positionnames_id) FROM stdin;
1	1	Ahmet Yılmaz	1	1	45000.50	3	2
2	2	Ayşe Kaya	2	1	38000.00	5	19
3	3	Mehmet Demir	1	2	25000.00	1	5
4	4	Ahmet Yılmaz	5	1	64648.00	3	12
5	5	Ayşe Demir	1	1	63300.00	3	1
6	6	Mehmet Kaya	3	1	26912.00	8	1
7	7	Fatma Çelik	5	1	80684.00	6	16
8	8	Mustafa Özkan	5	1	73032.00	7	18
9	9	Zeynep Şahin	4	1	55571.00	2	15
10	10	Emre Yıldız	1	1	28456.00	7	14
11	11	Elif Koç	1	1	70403.00	8	14
12	12	Burak Aydın	5	1	58287.00	10	13
13	13	Hande Özdemir	3	1	62452.00	4	13
14	14	Can Arslan	5	1	27177.00	2	9
15	15	Merve Doğan	5	1	55572.00	10	8
16	16	Volkan Kılıç	2	1	43568.00	9	7
17	17	Özlem Aksoy	3	1	25620.00	9	7
18	19	Büşra Yücel	4	1	31399.00	4	8
19	20	Tolga Avcı	1	1	57389.00	5	7
20	21	Gamze Polat	3	1	73702.00	5	2
21	22	Sinan Coşkun	2	1	77226.00	1	1
22	23	Pelin Korkmaz	1	1	52778.00	1	5
23	24	Onur Çetinkaya	5	1	72962.00	2	2
24	25	Esra Eroğlu	3	1	36030.00	11	4
25	26	Mert Bulut	3	1	63151.00	2	3
27	28	Selin Yaman	5	1	37077.00	6	1
26	27	Deniz Karaca	4	1	45256.00	11	8
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (userid, username, password) FROM stdin;
1	ahmet_yilmaz	sifre123
3	mehmet_demir	sifre789
2	ayse_kaya	$2b$10$m6x4t9je0zCyITZGeuN73e.DLCM6Yf5pDJmnQxAbyAsDBdrsRO52C
4	ahmet.yilmaz	Sifre123!
5	ayse.demir	Sifre123!
6	mehmet.kaya	Sifre123!
7	fatma.celik	Sifre123!
8	mustafa.ozkan	Sifre123!
9	zeynep.sahin	Sifre123!
10	emre.yildiz	Sifre123!
11	elif.koc	Sifre123!
12	burak.aydin	Sifre123!
13	hande.ozdemir	Sifre123!
14	can.arslan	Sifre123!
15	merve.dogan	Sifre123!
16	volkan.kilic	Sifre123!
17	ozlem.aksoy	Sifre123!
18	serkan.tasci	Sifre123!
19	busra.yucel	Sifre123!
20	tolga.avci	Sifre123!
21	gamze.polat	Sifre123!
22	sinan.coskun	Sifre123!
23	pelin.korkmaz	Sifre123!
24	onur.cetinkaya	Sifre123!
25	esra.eroglu	Sifre123!
26	mert.bulut	Sifre123!
27	deniz.karaca	Sifre123!
28	selin.yaman	Sifre123!
\.


--
-- Name: User_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_userid_seq"', 28, true);


--
-- Name: action_permissions_actionid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_permissions_actionid_seq', 11, true);


--
-- Name: company_companyid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_companyid_seq', 2, true);


--
-- Name: companyrooms_companyroomid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companyrooms_companyroomid_seq', 3, true);


--
-- Name: cv_cvid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cv_cvid_seq', 1, false);


--
-- Name: departments_departmentid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_departmentid_seq', 2, true);


--
-- Name: jobpost_jobpostid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobpost_jobpostid_seq', 5, true);


--
-- Name: meetings_meetingid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meetings_meetingid_seq', 2, true);


--
-- Name: menu_permissions_menuid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_permissions_menuid_seq', 8, true);


--
-- Name: positionnames_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positionnames_id_seq', 1, true);


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_id_seq', 1, false);


--
-- Name: request_requestid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_requestid_seq', 2, true);


--
-- Name: requesttype_requesttypeid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requesttype_requesttypeid_seq', 3, true);


--
-- Name: roles_roleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_roleid_seq', 4, true);


--
-- Name: userdetails_userdetailsid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userdetails_userdetailsid_seq', 27, true);


--
-- Name: users User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (userid);


--
-- Name: action_permissions action_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_permissions
    ADD CONSTRAINT action_permissions_pkey PRIMARY KEY (actionid);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (companyid);


--
-- Name: companyrooms companyrooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companyrooms
    ADD CONSTRAINT companyrooms_pkey PRIMARY KEY (companyroomid);


--
-- Name: cv cv_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT cv_pkey PRIMARY KEY (cvid);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (departmentid);


--
-- Name: jobposts jobpost_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobposts
    ADD CONSTRAINT jobpost_pkey PRIMARY KEY (jobpostid);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (meetingid);


--
-- Name: menu_permissions menu_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_permissions
    ADD CONSTRAINT menu_permissions_pkey PRIMARY KEY (menuid);


--
-- Name: positionnames positionnames_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positionnames
    ADD CONSTRAINT positionnames_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: positions positions_position_name_id_departmentid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_position_name_id_departmentid_key UNIQUE (position_name_id, departmentid);


--
-- Name: request request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT request_pkey PRIMARY KEY (requestid);


--
-- Name: requesttype requesttype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.requesttype
    ADD CONSTRAINT requesttype_pkey PRIMARY KEY (requesttypeid);


--
-- Name: role_action_permissions role_action_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_action_permissions
    ADD CONSTRAINT role_action_permissions_pkey PRIMARY KEY (roleid, actionid);


--
-- Name: role_menu_permissions role_menu_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_menu_permissions
    ADD CONSTRAINT role_menu_permissions_pkey PRIMARY KEY (roleid, menuid);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (roleid);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (userid, roleid);


--
-- Name: userdetails userdetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userdetails
    ADD CONSTRAINT userdetails_pkey PRIMARY KEY (userdetailsid);


--
-- Name: company company_companyroomid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_companyroomid_fkey FOREIGN KEY (companyroomid) REFERENCES public.companyrooms(companyroomid);


--
-- Name: cv cv_jobpostid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT cv_jobpostid_fkey FOREIGN KEY (jobpostid) REFERENCES public.jobposts(jobpostid) NOT VALID;


--
-- Name: jobposts jobpost_companyid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobposts
    ADD CONSTRAINT jobpost_companyid_fkey FOREIGN KEY (companyid) REFERENCES public.company(companyid);


--
-- Name: jobposts jobpost_createdbyuser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobposts
    ADD CONSTRAINT jobpost_createdbyuser_fkey FOREIGN KEY (createdbyuser) REFERENCES public.users(userid);


--
-- Name: jobposts jobpost_departmentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobposts
    ADD CONSTRAINT jobpost_departmentid_fkey FOREIGN KEY (departmentid) REFERENCES public.departments(departmentid);


--
-- Name: meetings meetings_companyroomid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_companyroomid_fkey FOREIGN KEY (companyroomid) REFERENCES public.companyrooms(companyroomid);


--
-- Name: positions positions_departmentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_departmentid_fkey FOREIGN KEY (departmentid) REFERENCES public.departments(departmentid);


--
-- Name: positions positions_position_name_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_position_name_id_fkey FOREIGN KEY (position_name_id) REFERENCES public.positionnames(id);


--
-- Name: request request_recieveruserid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT request_recieveruserid_fkey FOREIGN KEY (recieveruserid) REFERENCES public.users(userid);


--
-- Name: request request_requesttypeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT request_requesttypeid_fkey FOREIGN KEY (requesttypeid) REFERENCES public.requesttype(requesttypeid);


--
-- Name: request request_senderuserid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT request_senderuserid_fkey FOREIGN KEY (senderuserid) REFERENCES public.users(userid);


--
-- Name: role_action_permissions role_action_permissions_actionid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_action_permissions
    ADD CONSTRAINT role_action_permissions_actionid_fkey FOREIGN KEY (actionid) REFERENCES public.action_permissions(actionid);


--
-- Name: role_action_permissions role_action_permissions_roleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_action_permissions
    ADD CONSTRAINT role_action_permissions_roleid_fkey FOREIGN KEY (roleid) REFERENCES public.roles(roleid);


--
-- Name: role_menu_permissions role_menu_permissions_menuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_menu_permissions
    ADD CONSTRAINT role_menu_permissions_menuid_fkey FOREIGN KEY (menuid) REFERENCES public.menu_permissions(menuid);


--
-- Name: role_menu_permissions role_menu_permissions_roleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_menu_permissions
    ADD CONSTRAINT role_menu_permissions_roleid_fkey FOREIGN KEY (roleid) REFERENCES public.roles(roleid);


--
-- Name: user_roles user_roles_roleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_roleid_fkey FOREIGN KEY (roleid) REFERENCES public.roles(roleid);


--
-- Name: user_roles user_roles_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: userdetails userdetails_companyid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userdetails
    ADD CONSTRAINT userdetails_companyid_fkey FOREIGN KEY (companyid) REFERENCES public.company(companyid);


--
-- Name: userdetails userdetails_departmentid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userdetails
    ADD CONSTRAINT userdetails_departmentid_fkey FOREIGN KEY (departmentid) REFERENCES public.departments(departmentid);


--
-- Name: userdetails userdetails_positionnames_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userdetails
    ADD CONSTRAINT userdetails_positionnames_id_fkey FOREIGN KEY (positionnames_id) REFERENCES public.positionnames(id);


--
-- Name: userdetails userdetails_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userdetails
    ADD CONSTRAINT userdetails_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: SEQUENCE "User_userid_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."User_userid_seq" TO anon;
GRANT ALL ON SEQUENCE public."User_userid_seq" TO authenticated;
GRANT ALL ON SEQUENCE public."User_userid_seq" TO service_role;


--
-- Name: TABLE action_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.action_permissions TO anon;
GRANT ALL ON TABLE public.action_permissions TO authenticated;
GRANT ALL ON TABLE public.action_permissions TO service_role;


--
-- Name: SEQUENCE action_permissions_actionid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.action_permissions_actionid_seq TO anon;
GRANT ALL ON SEQUENCE public.action_permissions_actionid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.action_permissions_actionid_seq TO service_role;


--
-- Name: TABLE company; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.company TO anon;
GRANT ALL ON TABLE public.company TO authenticated;
GRANT ALL ON TABLE public.company TO service_role;


--
-- Name: SEQUENCE company_companyid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.company_companyid_seq TO anon;
GRANT ALL ON SEQUENCE public.company_companyid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.company_companyid_seq TO service_role;


--
-- Name: TABLE companyrooms; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.companyrooms TO anon;
GRANT ALL ON TABLE public.companyrooms TO authenticated;
GRANT ALL ON TABLE public.companyrooms TO service_role;


--
-- Name: SEQUENCE companyrooms_companyroomid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.companyrooms_companyroomid_seq TO anon;
GRANT ALL ON SEQUENCE public.companyrooms_companyroomid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.companyrooms_companyroomid_seq TO service_role;


--
-- Name: TABLE cv; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cv TO anon;
GRANT ALL ON TABLE public.cv TO authenticated;
GRANT ALL ON TABLE public.cv TO service_role;


--
-- Name: SEQUENCE cv_cvid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.cv_cvid_seq TO anon;
GRANT ALL ON SEQUENCE public.cv_cvid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.cv_cvid_seq TO service_role;


--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.departments TO anon;
GRANT ALL ON TABLE public.departments TO authenticated;
GRANT ALL ON TABLE public.departments TO service_role;


--
-- Name: SEQUENCE departments_departmentid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.departments_departmentid_seq TO anon;
GRANT ALL ON SEQUENCE public.departments_departmentid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.departments_departmentid_seq TO service_role;


--
-- Name: TABLE jobposts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.jobposts TO anon;
GRANT ALL ON TABLE public.jobposts TO authenticated;
GRANT ALL ON TABLE public.jobposts TO service_role;


--
-- Name: SEQUENCE jobpost_jobpostid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.jobpost_jobpostid_seq TO anon;
GRANT ALL ON SEQUENCE public.jobpost_jobpostid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.jobpost_jobpostid_seq TO service_role;


--
-- Name: TABLE meetings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.meetings TO anon;
GRANT ALL ON TABLE public.meetings TO authenticated;
GRANT ALL ON TABLE public.meetings TO service_role;


--
-- Name: SEQUENCE meetings_meetingid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.meetings_meetingid_seq TO anon;
GRANT ALL ON SEQUENCE public.meetings_meetingid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.meetings_meetingid_seq TO service_role;


--
-- Name: TABLE menu_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_permissions TO anon;
GRANT ALL ON TABLE public.menu_permissions TO authenticated;
GRANT ALL ON TABLE public.menu_permissions TO service_role;


--
-- Name: SEQUENCE menu_permissions_menuid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.menu_permissions_menuid_seq TO anon;
GRANT ALL ON SEQUENCE public.menu_permissions_menuid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.menu_permissions_menuid_seq TO service_role;


--
-- Name: TABLE positionnames; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.positionnames TO anon;
GRANT ALL ON TABLE public.positionnames TO authenticated;
GRANT ALL ON TABLE public.positionnames TO service_role;


--
-- Name: SEQUENCE positionnames_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.positionnames_id_seq TO anon;
GRANT ALL ON SEQUENCE public.positionnames_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.positionnames_id_seq TO service_role;


--
-- Name: TABLE positions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.positions TO anon;
GRANT ALL ON TABLE public.positions TO authenticated;
GRANT ALL ON TABLE public.positions TO service_role;


--
-- Name: SEQUENCE positions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.positions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.positions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.positions_id_seq TO service_role;


--
-- Name: TABLE request; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.request TO anon;
GRANT ALL ON TABLE public.request TO authenticated;
GRANT ALL ON TABLE public.request TO service_role;


--
-- Name: SEQUENCE request_requestid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.request_requestid_seq TO anon;
GRANT ALL ON SEQUENCE public.request_requestid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.request_requestid_seq TO service_role;


--
-- Name: TABLE requesttype; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.requesttype TO anon;
GRANT ALL ON TABLE public.requesttype TO authenticated;
GRANT ALL ON TABLE public.requesttype TO service_role;


--
-- Name: SEQUENCE requesttype_requesttypeid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.requesttype_requesttypeid_seq TO anon;
GRANT ALL ON SEQUENCE public.requesttype_requesttypeid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.requesttype_requesttypeid_seq TO service_role;


--
-- Name: TABLE role_action_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.role_action_permissions TO anon;
GRANT ALL ON TABLE public.role_action_permissions TO authenticated;
GRANT ALL ON TABLE public.role_action_permissions TO service_role;


--
-- Name: TABLE role_menu_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.role_menu_permissions TO anon;
GRANT ALL ON TABLE public.role_menu_permissions TO authenticated;
GRANT ALL ON TABLE public.role_menu_permissions TO service_role;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;


--
-- Name: SEQUENCE roles_roleid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_roleid_seq TO anon;
GRANT ALL ON SEQUENCE public.roles_roleid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.roles_roleid_seq TO service_role;


--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;


--
-- Name: TABLE userdetails; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.userdetails TO anon;
GRANT ALL ON TABLE public.userdetails TO authenticated;
GRANT ALL ON TABLE public.userdetails TO service_role;


--
-- Name: SEQUENCE userdetails_userdetailsid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.userdetails_userdetailsid_seq TO anon;
GRANT ALL ON SEQUENCE public.userdetails_userdetailsid_seq TO authenticated;
GRANT ALL ON SEQUENCE public.userdetails_userdetailsid_seq TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict C9HG0L2eXUoKwnIN9w2So1Yy4O80Z2kdlGSebVXf6lKXG9bqe4NLvodN4TbUGfd

