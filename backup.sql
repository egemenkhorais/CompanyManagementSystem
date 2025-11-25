--
-- PostgreSQL database dump
--

\restrict XF6eHYMWaHSJWGdRe06eIebvdxbTc4xRzxcoaGYYJt32KrP1TjadztxlI6zXIAH

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
    cvname character varying(100),
    cvdate timestamp without time zone,
    cvitself bytea
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
    departmentname character varying(100),
    positionname character varying(100)
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
    yearsworked integer
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

COPY public.cv (cvid, cvname, cvdate, cvitself) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (departmentid, departmentname, positionname) FROM stdin;
1	IT Departmanı	\N
2	İnsan Kaynakları	\N
\.


--
-- Data for Name: jobposts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobposts (jobpostid, expectations, departmentid, companyid, createdbyuser) FROM stdin;
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

COPY public.userdetails (userdetailsid, userid, name, departmentid, companyid, usersalary, yearsworked) FROM stdin;
1	1	Ahmet Yılmaz	1	1	45000.50	3
2	2	Ayşe Kaya	2	1	38000.00	5
3	3	Mehmet Demir	1	2	25000.00	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (userid, username, password) FROM stdin;
1	ahmet_yilmaz	sifre123
3	mehmet_demir	sifre789
2	ayse_kaya	$2b$10$m6x4t9je0zCyITZGeuN73e.DLCM6Yf5pDJmnQxAbyAsDBdrsRO52C
\.


--
-- Name: User_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_userid_seq"', 3, true);


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

SELECT pg_catalog.setval('public.jobpost_jobpostid_seq', 1, false);


--
-- Name: meetings_meetingid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meetings_meetingid_seq', 2, true);


--
-- Name: menu_permissions_menuid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_permissions_menuid_seq', 8, true);


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

SELECT pg_catalog.setval('public.userdetails_userdetailsid_seq', 3, true);


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

\unrestrict XF6eHYMWaHSJWGdRe06eIebvdxbTc4xRzxcoaGYYJt32KrP1TjadztxlI6zXIAH

