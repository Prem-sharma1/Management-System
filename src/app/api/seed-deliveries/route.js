import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const rawData = `Delivery ID	Client ID	Client Name	Post Type	Post Date	Status	Linked Task ID	Working On	Notes
DEL-AID-0004-SM-GRAPHIC-1	AID-0004	Shree Broadband	Graphic	04-Feb-2026	Pending	AID-0004-SM-GRAPHIC-1	Sanmeet	
DEL-AID-0004-SM-REELS-1	AID-0004	Shree Broadband	Reel	06-Feb-2026	Pending	AID-0004-SM-REELS-1	Sanmeet	
DEL-AID-0004-SM-GRAPHIC-2	AID-0004	Shree Broadband	Graphic	08-Feb-2026	Pending	AID-0004-SM-GRAPHIC-2	Sanmeet	
DEL-AID-0005-SM-GRAPHIC-1	AID-0005	A Siddhanatth Car's	Graphic	09-Feb-2026	Pending	AID-0005-SM-GRAPHIC-1		
DEL-AID-0004-SM-AI-VIDEOS-1	AID-0004	Shree Broadband	AI Video	11-Feb-2026	Pending	AID-0004-SM-AI-VIDEOS-1	Sanmeet	
DEL-AID-0005-SM-REELS-1	AID-0005	A Siddhanatth Car's	Reel	11-Feb-2026	Pending	AID-0005-SM-REELS-1		
DEL-AID-0004-SM-GRAPHIC-3	AID-0004	Shree Broadband	Graphic	12-Feb-2026	Pending	AID-0004-SM-GRAPHIC-3	Sanmeet	
DEL-AID-0005-SM-GRAPHIC-2	AID-0005	A Siddhanatth Car's	Graphic	13-Feb-2026	Pending	AID-0005-SM-GRAPHIC-2		
DEL-AID-0004-SM-REELS-2	AID-0004	Shree Broadband	Reel	14-Feb-2026	Pending	AID-0004-SM-REELS-2	Sanmeet	
DEL-AID-0004-SM-GRAPHIC-4	AID-0004	Shree Broadband	Graphic	16-Feb-2026	Pending	AID-0004-SM-GRAPHIC-4	Sanmeet	
DEL-AID-0005-SM-AI-VIDEOS-1	AID-0005	A Siddhanatth Car's	AI Video	16-Feb-2026	Pending	AID-0005-SM-AI-VIDEOS-1		
DEL-AID-0005-SM-GRAPHIC-3	AID-0005	A Siddhanatth Car's	Graphic	17-Feb-2026	Pending	AID-0005-SM-GRAPHIC-3		
DEL-AID-0004-SM-AI-VIDEOS-2	AID-0004	Shree Broadband	AI Video	19-Feb-2026	Pending	AID-0004-SM-AI-VIDEOS-2	Sanmeet	
DEL-AID-0005-SM-REELS-2	AID-0005	A Siddhanatth Car's	Reel	19-Feb-2026	Pending	AID-0005-SM-REELS-2		
DEL-AID-0004-SM-GRAPHIC-5	AID-0004	Shree Broadband	Graphic	20-Feb-2026	Pending	AID-0004-SM-GRAPHIC-5	Sanmeet	
DEL-AID-0005-SM-GRAPHIC-4	AID-0005	A Siddhanatth Car's	Graphic	21-Feb-2026	Pending	AID-0005-SM-GRAPHIC-4		
DEL-AID-0004-SM-REELS-3	AID-0004	Shree Broadband	Reel	22-Feb-2026	Pending	AID-0004-SM-REELS-3	Sanmeet	
DEL-AID-0005-SM-REELS-3	AID-0005	A Siddhanatth Car's	Reel	23-Feb-2026	Pending	AID-0005-SM-REELS-3		
DEL-AID-0004-SM-GRAPHIC-6	AID-0004	Shree Broadband	Graphic	24-Feb-2026	Pending	AID-0004-SM-GRAPHIC-6	Sanmeet	
DEL-AID-0006-SM-GRAPHIC-1	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Graphic	25-Feb-2026	Pending	AID-0006-SM-GRAPHIC-1	Sanmeet	
DEL-AID-0004-SM-REELS-4	AID-0004	Shree Broadband	Reel	26-Feb-2026	Pending	AID-0004-SM-REELS-4	Sanmeet	
DEL-AID-0006-SM-REELS-1	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Reel	27-Feb-2026	Pending	AID-0006-SM-REELS-1	Sanmeet	
DEL-AID-0004-SM-REELS-5	AID-0004	Shree Broadband	Reel	28-Feb-2026	Pending	AID-0004-SM-REELS-5	Sanmeet	
DEL-AID-0006-SM-GRAPHIC-2	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Graphic	01-Mar-2026	Pending	AID-0006-SM-GRAPHIC-2	Sanmeet	
DEL-AID-0006-SM-AI-VIDEOS-1	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	AI Video	04-Mar-2026	Pending	AID-0006-SM-AI-VIDEOS-1	Sanmeet	
DEL-AID-0006-SM-GRAPHIC-3	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Graphic	05-Mar-2026	Pending	AID-0006-SM-GRAPHIC-3	Pujan	
DEL-AID-0007-SM-GRAPHIC-1	AID-0007	Shree Renuka Opticals	Graphic	05-Mar-2026	Pending	AID-0007-SM-GRAPHIC-1	Harshit	
DEL-AID-0006-SM-REELS-2	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Reel	07-Mar-2026	Pending	AID-0006-SM-REELS-2	Harshit	
DEL-AID-0007-SM-REELS-1	AID-0007	Shree Renuka Opticals	Reel	07-Mar-2026	Pending	AID-0007-SM-REELS-1	Harshit	
DEL-AID-0006-SM-GRAPHIC-4	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Graphic	09-Mar-2026	Pending	AID-0006-SM-GRAPHIC-4	Harshit	
DEL-AID-0007-SM-GRAPHIC-2	AID-0007	Shree Renuka Opticals	Graphic	09-Mar-2026	Pending	AID-0007-SM-GRAPHIC-2	Harshit	
DEL-AID-0006-SM-AI-VIDEOS-2	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	AI Video	12-Mar-2026	Pending	AID-0006-SM-AI-VIDEOS-2	Harshit	
DEL-AID-0007-SM-AI-VIDEOS-1	AID-0007	Shree Renuka Opticals	AI Video	12-Mar-2026	Pending	AID-0007-SM-AI-VIDEOS-1	Harshit	
DEL-AID-0006-SM-GRAPHIC-5	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Graphic	13-Mar-2026	Pending	AID-0006-SM-GRAPHIC-5	Harshit	
DEL-AID-0007-SM-GRAPHIC-3	AID-0007	Shree Renuka Opticals	Graphic	13-Mar-2026	Pending	AID-0007-SM-GRAPHIC-3	Harshit	
DEL-AID-0009-SM-POST-1	AID-0009	Prash Ayurveda	Graphic	14-Mar-2026	Pending	AID-0009-SM-POST-1	Harshit	
DEL-AID-0006-SM-REELS-3	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Reel	15-Mar-2026	Pending	AID-0006-SM-REELS-3	Harshit	
DEL-AID-0007-SM-REELS-2	AID-0007	Shree Renuka Opticals	Reel	15-Mar-2026	Pending	AID-0007-SM-REELS-2	Harshit	
DEL-AID-0009-SM-POST-2	AID-0009	Prash Ayurveda	Graphic	16-Mar-2026	Pending	AID-0009-SM-POST-2	Harshit	
DEL-AID-0010-SM-POST-1	AID-0010	Socio-Political	Graphic	16-Mar-2026	Pending	AID-0010-SM-POST-1	Danish	
DEL-AID-0008-SM-GRAPHIC-1	AID-0008	Vidhivihan Agro Product	Graphic	17-Mar-2026	Pending	AID-0008-SM-GRAPHIC-1	Danish	
DEL-AID-0006-SM-GRAPHIC-6	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Graphic	17-Mar-2026	Pending	AID-0006-SM-GRAPHIC-6	Danish	
DEL-AID-0007-SM-GRAPHIC-4	AID-0007	Shree Renuka Opticals	Graphic	17-Mar-2026	Pending	AID-0007-SM-GRAPHIC-4	Danish	
DEL-AID-0009-SM-POST-3	AID-0009	Prash Ayurveda	Graphic	18-Mar-2026	Pending	AID-0009-SM-POST-3	Danish	
DEL-AID-0010-SM-POST-2	AID-0010	Socio-Political	Graphic	18-Mar-2026	Pending	AID-0010-SM-POST-2	Danish	
DEL-AID-0008-SM-REELS-1	AID-0008	Vidhivihan Agro Product	Reel	19-Mar-2026	Pending	AID-0008-SM-REELS-1	Danish	
DEL-AID-0006-SM-REELS-4	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Reel	19-Mar-2026	Pending	AID-0006-SM-REELS-4		
DEL-AID-0009-SM-POST-4	AID-0009	Prash Ayurveda	Graphic	20-Mar-2026	Pending	AID-0009-SM-POST-4	Danish	
DEL-AID-0010-SM-POST-3	AID-0010	Socio-Political	Graphic	20-Mar-2026	Pending	AID-0010-SM-POST-3	Danish	
DEL-AID-0011-SM-GRAPHIC-1	AID-0011	Sanskruti Pre School	Graphic	20-Mar-2026	Pending	AID-0011-SM-GRAPHIC-1		
DEL-AID-0007-SM-AI-VIDEOS-2	AID-0007	Shree Renuka Opticals	AI Video	20-Mar-2026	Pending	AID-0007-SM-AI-VIDEOS-2	Danish	
DEL-AID-0008-SM-GRAPHIC-2	AID-0008	Vidhivihan Agro Product	Graphic	21-Mar-2026	Pending	AID-0008-SM-GRAPHIC-2		
DEL-AID-0006-SM-REELS-5	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Reel	21-Mar-2026	Pending	AID-0006-SM-REELS-5		
DEL-AID-0007-SM-GRAPHIC-5	AID-0007	Shree Renuka Opticals	Graphic	21-Mar-2026	Pending	AID-0007-SM-GRAPHIC-5		
DEL-AID-0009-SM-POST-5	AID-0009	Prash Ayurveda	Graphic	22-Mar-2026	Pending	AID-0009-SM-POST-5		
DEL-AID-0010-SM-POST-4	AID-0010	Socio-Political	Graphic	22-Mar-2026	Pending	AID-0010-SM-POST-4		
DEL-AID-0011-SM-REELS-1	AID-0011	Sanskruti Pre School	Reel	22-Mar-2026	Pending	AID-0011-SM-REELS-1		
DEL-AID-0012-SM-GRAPHIC-1	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Graphic	22-Mar-2026	Pending	AID-0012-SM-GRAPHIC-1		
DEL-AID-0013-SM-GRAPHIC-1	AID-0013	Swapna Bhumi (Sheetal Methri)	Graphic	23-Mar-2026	Pending	AID-0013-SM-GRAPHIC-1		
DEL-AID-0007-SM-REELS-3	AID-0007	Shree Renuka Opticals	Reel	23-Mar-2026	Pending	AID-0007-SM-REELS-3		
DEL-AID-0009-SM-POST-6	AID-0009	Prash Ayurveda	Graphic	24-Mar-2026	Pending	AID-0009-SM-POST-6		
DEL-AID-0010-SM-POST-5	AID-0010	Socio-Political	Graphic	24-Mar-2026	Pending	AID-0010-SM-POST-5		
DEL-AID-0011-SM-GRAPHIC-2	AID-0011	Sanskruti Pre School	Graphic	24-Mar-2026	Pending	AID-0011-SM-GRAPHIC-2		
DEL-AID-0012-SM-REELS-1	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Reel	24-Mar-2026	Pending	AID-0012-SM-REELS-1		
DEL-AID-0013-SM-REELS-1	AID-0013	Swapna Bhumi (Sheetal Methri)	Reel	25-Mar-2026	Pending	AID-0013-SM-REELS-1		
DEL-AID-0007-SM-GRAPHIC-6	AID-0007	Shree Renuka Opticals	Graphic	25-Mar-2026	Pending	AID-0007-SM-GRAPHIC-6		
DEL-AID-0009-SM-POST-7	AID-0009	Prash Ayurveda	Graphic	26-Mar-2026	Pending	AID-0009-SM-POST-7		
DEL-AID-0010-SM-POST-6	AID-0010	Socio-Political	Graphic	26-Mar-2026	Pending	AID-0010-SM-POST-6		
DEL-AID-0012-SM-GRAPHIC-2	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Graphic	26-Mar-2026	Pending	AID-0012-SM-GRAPHIC-2		
DEL-AID-0014-SM-GRAPHIC-1	AID-0014	Mountain Bliss( Chetan Choudhari)	Graphic	26-Mar-2026	Pending	AID-0014-SM-GRAPHIC-1		
DEL-AID-0011-SM-AI-VIDEOS-1	AID-0011	Sanskruti Pre School	AI Video	27-Mar-2026	Pending	AID-0011-SM-AI-VIDEOS-1		
DEL-AID-0013-SM-GRAPHIC-2	AID-0013	Swapna Bhumi (Sheetal Methri)	Graphic	27-Mar-2026	Pending	AID-0013-SM-GRAPHIC-2		
DEL-AID-0007-SM-REELS-4	AID-0007	Shree Renuka Opticals	Reel	27-Mar-2026	Pending	AID-0007-SM-REELS-4		
DEL-AID-0009-SM-POST-8	AID-0009	Prash Ayurveda	Graphic	28-Mar-2026	Pending	AID-0009-SM-POST-8		
DEL-AID-0010-SM-POST-7	AID-0010	Socio-Political	Graphic	28-Mar-2026	Pending	AID-0010-SM-POST-7		
DEL-AID-0011-SM-GRAPHIC-3	AID-0011	Sanskruti Pre School	Graphic	28-Mar-2026	Pending	AID-0011-SM-GRAPHIC-3		
DEL-AID-0014-SM-REELS-1	AID-0014	Mountain Bliss( Chetan Choudhari)	Reel	28-Mar-2026	Pending	AID-0014-SM-REELS-1		
DEL-AID-0015-SM-GRAPHIC-1	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Graphic	28-Mar-2026	Pending	AID-0015-SM-GRAPHIC-1		
DEL-AID-0012-SM-AI-VIDEOS-1	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	AI Video	29-Mar-2026	Pending	AID-0012-SM-AI-VIDEOS-1		
DEL-AID-0016-SM-GRAPHIC-1	AID-0016	Sethji Organics(Raaj Marwadi)	Graphic	29-Mar-2026	Pending	AID-0016-SM-GRAPHIC-1		
DEL-AID-0007-SM-REELS-5	AID-0007	Shree Renuka Opticals	Reel	29-Mar-2026	Pending	AID-0007-SM-REELS-5		
DEL-AID-0009-SM-POST-9	AID-0009	Prash Ayurveda	Graphic	30-Mar-2026	Pending	AID-0009-SM-POST-9		
DEL-AID-0010-SM-POST-8	AID-0010	Socio-Political	Graphic	30-Mar-2026	Pending	AID-0010-SM-POST-8		
DEL-AID-0011-SM-REELS-2	AID-0011	Sanskruti Pre School	Reel	30-Mar-2026	Pending	AID-0011-SM-REELS-2		
DEL-AID-0012-SM-GRAPHIC-3	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Graphic	30-Mar-2026	Pending	AID-0012-SM-GRAPHIC-3		
DEL-AID-0013-SM-AI-VIDEOS-1	AID-0013	Swapna Bhumi (Sheetal Methri)	AI Video	30-Mar-2026	Pending	AID-0013-SM-AI-VIDEOS-1		
DEL-AID-0014-SM-GRAPHIC-2	AID-0014	Mountain Bliss( Chetan Choudhari)	Graphic	30-Mar-2026	Pending	AID-0014-SM-GRAPHIC-2		
DEL-AID-0015-SM-REELS-1	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Reel	30-Mar-2026	Pending	AID-0015-SM-REELS-1		
DEL-AID-0013-SM-GRAPHIC-3	AID-0013	Swapna Bhumi (Sheetal Methri)	Graphic	31-Mar-2026	Pending	AID-0013-SM-GRAPHIC-3		
DEL-AID-0016-SM-REELS-1	AID-0016	Sethji Organics(Raaj Marwadi)	Reel	31-Mar-2026	Pending	AID-0016-SM-REELS-1		
DEL-AID-0009-SM-POST-10	AID-0009	Prash Ayurveda	Graphic	01-Apr-2026	Pending	AID-0009-SM-POST-10		
DEL-AID-0010-SM-POST-9	AID-0010	Socio-Political	Graphic	01-Apr-2026	Pending	AID-0010-SM-POST-9		
DEL-AID-0011-SM-GRAPHIC-4	AID-0011	Sanskruti Pre School	Graphic	01-Apr-2026	Pending	AID-0011-SM-GRAPHIC-4		
DEL-AID-0012-SM-REELS-2	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Reel	01-Apr-2026	Pending	AID-0012-SM-REELS-2		
DEL-AID-0015-SM-GRAPHIC-2	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Graphic	01-Apr-2026	Pending	AID-0015-SM-GRAPHIC-2		
DEL-AID-0013-SM-REELS-2	AID-0013	Swapna Bhumi (Sheetal Methri)	Reel	02-Apr-2026	Pending	AID-0013-SM-REELS-2		
DEL-AID-0014-SM-AI-VIDEOS-1	AID-0014	Mountain Bliss( Chetan Choudhari)	AI Video	02-Apr-2026	Pending	AID-0014-SM-AI-VIDEOS-1		
DEL-AID-0016-SM-GRAPHIC-2	AID-0016	Sethji Organics(Raaj Marwadi)	Graphic	02-Apr-2026	Pending	AID-0016-SM-GRAPHIC-2		
DEL-AID-0010-SM-POST-10	AID-0010	Socio-Political	Graphic	03-Apr-2026	Pending	AID-0010-SM-POST-10		
DEL-AID-0011-SM-GRAPHIC-5	AID-0011	Sanskruti Pre School	Graphic	03-Apr-2026	Pending	AID-0011-SM-GRAPHIC-5		
DEL-AID-0012-SM-GRAPHIC-4	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Graphic	03-Apr-2026	Pending	AID-0012-SM-GRAPHIC-4		
DEL-AID-0014-SM-GRAPHIC-3	AID-0014	Mountain Bliss( Chetan Choudhari)	Graphic	03-Apr-2026	Pending	AID-0014-SM-GRAPHIC-3		
DEL-AID-0013-SM-GRAPHIC-4	AID-0013	Swapna Bhumi (Sheetal Methri)	Graphic	04-Apr-2026	Pending	AID-0013-SM-GRAPHIC-4		
DEL-AID-0015-SM-AI-VIDEOS-1	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	AI Video	04-Apr-2026	Pending	AID-0015-SM-AI-VIDEOS-1		
DEL-AID-0017-SM-GRAPHIC-1	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Graphic	04-Apr-2026	Pending	AID-0017-SM-GRAPHIC-1		
DEL-AID-0010-SM-POST-11	AID-0010	Socio-Political	Graphic	05-Apr-2026	Pending	AID-0010-SM-POST-11		
DEL-AID-0011-SM-REELS-3	AID-0011	Sanskruti Pre School	Reel	05-Apr-2026	Pending	AID-0011-SM-REELS-3		
DEL-AID-0014-SM-REELS-2	AID-0014	Mountain Bliss( Chetan Choudhari)	Reel	05-Apr-2026	Pending	AID-0014-SM-REELS-2		
DEL-AID-0015-SM-GRAPHIC-3	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Graphic	05-Apr-2026	Pending	AID-0015-SM-GRAPHIC-3		
DEL-AID-0016-SM-AI-VIDEOS-1	AID-0016	Sethji Organics(Raaj Marwadi)	AI Video	05-Apr-2026	Pending	AID-0016-SM-AI-VIDEOS-1		
DEL-AID-0012-SM-AI-VIDEOS-2	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	AI Video	06-Apr-2026	Pending	AID-0012-SM-AI-VIDEOS-2		
DEL-AID-0016-SM-GRAPHIC-3	AID-0016	Sethji Organics(Raaj Marwadi)	Graphic	06-Apr-2026	Pending	AID-0016-SM-GRAPHIC-3		
DEL-AID-0017-SM-REELS-1	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Reel	06-Apr-2026	Pending	AID-0017-SM-REELS-1		
DEL-AID-0018-SM-GRAPHIC-1	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	Graphic	06-Apr-2026	Pending	AID-0018-SM-GRAPHIC-1		
DEL-AID-0010-SM-POST-12	AID-0010	Socio-Political	Graphic	07-Apr-2026	Pending	AID-0010-SM-POST-12		
DEL-AID-0011-SM-GRAPHIC-6	AID-0011	Sanskruti Pre School	Graphic	07-Apr-2026	Pending	AID-0011-SM-GRAPHIC-6		
DEL-AID-0012-SM-GRAPHIC-5	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Graphic	07-Apr-2026	Pending	AID-0012-SM-GRAPHIC-5		
DEL-AID-0013-SM-AI-VIDEOS-2	AID-0013	Swapna Bhumi (Sheetal Methri)	AI Video	07-Apr-2026	Pending	AID-0013-SM-AI-VIDEOS-2		
DEL-AID-0014-SM-GRAPHIC-4	AID-0014	Mountain Bliss( Chetan Choudhari)	Graphic	07-Apr-2026	Pending	AID-0014-SM-GRAPHIC-4		
DEL-AID-0015-SM-REELS-2	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Reel	07-Apr-2026	Pending	AID-0015-SM-REELS-2		
DEL-AID-0019-SM-GRAPHIC-1	AID-0019	Agri field (Satyajeet Patil)	Graphic	07-Apr-2026	Pending	AID-0019-SM-GRAPHIC-1		
DEL-AID-0013-SM-GRAPHIC-5	AID-0013	Swapna Bhumi (Sheetal Methri)	Graphic	08-Apr-2026	Pending	AID-0013-SM-GRAPHIC-5		
DEL-AID-0016-SM-REELS-2	AID-0016	Sethji Organics(Raaj Marwadi)	Reel	08-Apr-2026	Pending	AID-0016-SM-REELS-2		
DEL-AID-0017-SM-GRAPHIC-2	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Graphic	08-Apr-2026	Pending	AID-0017-SM-GRAPHIC-2		
DEL-AID-0018-SM-REELS-1	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	Reel	08-Apr-2026	Pending	AID-0018-SM-REELS-1		
DEL-AID-0010-SM-POST-13	AID-0010	Socio-Political	Graphic	09-Apr-2026	Pending	AID-0010-SM-POST-13		
DEL-AID-0011-SM-GRAPHIC-7	AID-0011	Sanskruti Pre School	Graphic	09-Apr-2026	Pending	AID-0011-SM-GRAPHIC-7		
DEL-AID-0012-SM-REELS-3	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Reel	09-Apr-2026	Pending	AID-0012-SM-REELS-3		
DEL-AID-0015-SM-GRAPHIC-4	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Graphic	09-Apr-2026	Pending	AID-0015-SM-GRAPHIC-4		
DEL-AID-0019-SM-REELS-1	AID-0019	Agri field (Satyajeet Patil)	Reel	09-Apr-2026	Pending	AID-0019-SM-REELS-1		
DEL-AID-0013-SM-REELS-3	AID-0013	Swapna Bhumi (Sheetal Methri)	Reel	10-Apr-2026	Pending	AID-0013-SM-REELS-3		
DEL-AID-0014-SM-AI-VIDEOS-2	AID-0014	Mountain Bliss( Chetan Choudhari)	AI Video	10-Apr-2026	Pending	AID-0014-SM-AI-VIDEOS-2		
DEL-AID-0016-SM-GRAPHIC-4	AID-0016	Sethji Organics(Raaj Marwadi)	Graphic	10-Apr-2026	Pending	AID-0016-SM-GRAPHIC-4		
DEL-AID-0018-SM-GRAPHIC-2	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	Graphic	10-Apr-2026	Pending	AID-0018-SM-GRAPHIC-2		
DEL-AID-0022-SM-GRAPHIC-1	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	Graphic	10-Apr-2026	Pending	AID-0022-SM-GRAPHIC-1		
DEL-AID-0010-SM-POST-14	AID-0010	Socio-Political	Graphic	11-Apr-2026	Pending	AID-0010-SM-POST-14		
DEL-AID-0011-SM-GRAPHIC-8	AID-0011	Sanskruti Pre School	Graphic	11-Apr-2026	Pending	AID-0011-SM-GRAPHIC-8		
DEL-AID-0012-SM-GRAPHIC-6	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Graphic	11-Apr-2026	Pending	AID-0012-SM-GRAPHIC-6		
DEL-AID-0014-SM-GRAPHIC-5	AID-0014	Mountain Bliss( Chetan Choudhari)	Graphic	11-Apr-2026	Pending	AID-0014-SM-GRAPHIC-5		
DEL-AID-0017-SM-AI-VIDEOS-1	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	AI Video	11-Apr-2026	Pending	AID-0017-SM-AI-VIDEOS-1		
DEL-AID-0019-SM-GRAPHIC-2	AID-0019	Agri field (Satyajeet Patil)	Graphic	11-Apr-2026	Pending	AID-0019-SM-GRAPHIC-2		
DEL-AID-0013-SM-GRAPHIC-6	AID-0013	Swapna Bhumi (Sheetal Methri)	Graphic	12-Apr-2026	Pending	AID-0013-SM-GRAPHIC-6		
DEL-AID-0015-SM-AI-VIDEOS-2	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	AI Video	12-Apr-2026	Pending	AID-0015-SM-AI-VIDEOS-2		
DEL-AID-0017-SM-GRAPHIC-3	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Graphic	12-Apr-2026	Pending	AID-0017-SM-GRAPHIC-3		
DEL-AID-0022-SM-REELS-1	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	Reel	12-Apr-2026	Pending	AID-0022-SM-REELS-1		
DEL-AID-0010-SM-POST-15	AID-0010	Socio-Political	Graphic	13-Apr-2026	Pending	AID-0010-SM-POST-15		
DEL-AID-0011-SM-GRAPHIC-9	AID-0011	Sanskruti Pre School	Graphic	13-Apr-2026	Pending	AID-0011-SM-GRAPHIC-9		
DEL-AID-0012-SM-REELS-4	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Reel	13-Apr-2026	Pending	AID-0012-SM-REELS-4		
DEL-AID-0014-SM-REELS-3	AID-0014	Mountain Bliss( Chetan Choudhari)	Reel	13-Apr-2026	Pending	AID-0014-SM-REELS-3		
DEL-AID-0015-SM-GRAPHIC-5	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Graphic	13-Apr-2026	Pending	AID-0015-SM-GRAPHIC-5		
DEL-AID-0016-SM-AI-VIDEOS-2	AID-0016	Sethji Organics(Raaj Marwadi)	AI Video	13-Apr-2026	Pending	AID-0016-SM-AI-VIDEOS-2		
DEL-AID-0018-SM-AI-VIDEOS-1	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	AI Video	13-Apr-2026	Pending	AID-0018-SM-AI-VIDEOS-1		
DEL-AID-0013-SM-REELS-4	AID-0013	Swapna Bhumi (Sheetal Methri)	Reel	14-Apr-2026	Pending	AID-0013-SM-REELS-4		
DEL-AID-0016-SM-REELS-3	AID-0016	Sethji Organics(Raaj Marwadi)	Reel	14-Apr-2026	Pending	AID-0016-SM-REELS-3		
DEL-AID-0017-SM-REELS-2	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Reel	14-Apr-2026	Pending	AID-0017-SM-REELS-2		
DEL-AID-0018-SM-GRAPHIC-3	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	Graphic	14-Apr-2026	Pending	AID-0018-SM-GRAPHIC-3		
DEL-AID-0019-SM-AI-VIDEOS-1	AID-0019	Agri field (Satyajeet Patil)	AI Video	14-Apr-2026	Pending	AID-0019-SM-AI-VIDEOS-1		
DEL-AID-0022-SM-GRAPHIC-2	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	Graphic	14-Apr-2026	Pending	AID-0022-SM-GRAPHIC-2		
DEL-AID-0023-SM-GRAPHIC-1	AID-0023	Dr. Sneha's PhysioTech	Graphic	14-Apr-2026	Pending	AID-0023-SM-GRAPHIC-1		
DEL-AID-0010-SM-POST-16	AID-0010	Socio-Political	Graphic	15-Apr-2026	Pending	AID-0010-SM-POST-16		
DEL-AID-0011-SM-GRAPHIC-10	AID-0011	Sanskruti Pre School	Graphic	15-Apr-2026	Pending	AID-0011-SM-GRAPHIC-10		
DEL-AID-0012-SM-REELS-5	AID-0012	ONS Rudra Electrical & Constraction Pvt.Ltd(Jayesh Suryawashi)	Reel	15-Apr-2026	Pending	AID-0012-SM-REELS-5		
DEL-AID-0014-SM-GRAPHIC-6	AID-0014	Mountain Bliss( Chetan Choudhari)	Graphic	15-Apr-2026	Pending	AID-0014-SM-GRAPHIC-6		
DEL-AID-0015-SM-REELS-3	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Reel	15-Apr-2026	Pending	AID-0015-SM-REELS-3		
DEL-AID-0019-SM-GRAPHIC-3	AID-0019	Agri field (Satyajeet Patil)	Graphic	15-Apr-2026	Pending	AID-0019-SM-GRAPHIC-3		
DEL-AID-0013-SM-REELS-5	AID-0013	Swapna Bhumi (Sheetal Methri)	Reel	16-Apr-2026	Pending	AID-0013-SM-REELS-5		
DEL-AID-0016-SM-REELS-4	AID-0016	Sethji Organics(Raaj Marwadi)	Reel	16-Apr-2026	Pending	AID-0016-SM-REELS-4		
DEL-AID-0017-SM-GRAPHIC-4	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Graphic	16-Apr-2026	Pending	AID-0017-SM-GRAPHIC-4		
DEL-AID-0018-SM-REELS-2	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	Reel	16-Apr-2026	Pending	AID-0018-SM-REELS-2		
DEL-AID-0023-SM-REELS-1	AID-0023	Dr. Sneha's PhysioTech	Reel	16-Apr-2026	Pending	AID-0023-SM-REELS-1		
DEL-AID-0024-SM-GRAPHIC-1	AID-0024	LIC Insurance	Graphic	16-Apr-2026	Pending	AID-0024-SM-GRAPHIC-1		
DEL-AID-0010-SM-POST-17	AID-0010	Socio-Political	Graphic	17-Apr-2026	Pending	AID-0010-SM-POST-17		
DEL-AID-0011-SM-GRAPHIC-11	AID-0011	Sanskruti Pre School	Graphic	17-Apr-2026	Pending	AID-0011-SM-GRAPHIC-11		
DEL-AID-0014-SM-REELS-4	AID-0014	Mountain Bliss( Chetan Choudhari)	Reel	17-Apr-2026	Pending	AID-0014-SM-REELS-4		
DEL-AID-0015-SM-GRAPHIC-6	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Graphic	17-Apr-2026	Pending	AID-0015-SM-GRAPHIC-6		
DEL-AID-0019-SM-REELS-2	AID-0019	Agri field (Satyajeet Patil)	Reel	17-Apr-2026	Pending	AID-0019-SM-REELS-2		
DEL-AID-0022-SM-AI-VIDEOS-1	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	AI Video	17-Apr-2026	Pending	AID-0022-SM-AI-VIDEOS-1		
DEL-AID-0016-SM-REELS-5	AID-0016	Sethji Organics(Raaj Marwadi)	Reel	18-Apr-2026	Pending	AID-0016-SM-REELS-5		
DEL-AID-0017-SM-GRAPHIC-5	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Graphic	18-Apr-2026	Pending	AID-0017-SM-GRAPHIC-5		
DEL-AID-0018-SM-GRAPHIC-4	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	Graphic	18-Apr-2026	Pending	AID-0018-SM-GRAPHIC-4		
DEL-AID-0022-SM-GRAPHIC-3	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	Graphic	18-Apr-2026	Pending	AID-0022-SM-GRAPHIC-3		
DEL-AID-0023-SM-GRAPHIC-2	AID-0023	Dr. Sneha's PhysioTech	Graphic	18-Apr-2026	Pending	AID-0023-SM-GRAPHIC-2		
DEL-AID-0024-SM-REELS-1	AID-0024	LIC Insurance	Reel	18-Apr-2026	Pending	AID-0024-SM-REELS-1		
DEL-AID-0010-SM-POST-18	AID-0010	Socio-Political	Graphic	19-Apr-2026	Pending	AID-0010-SM-POST-18		
DEL-AID-0011-SM-GRAPHIC-12	AID-0011	Sanskruti Pre School	Graphic	19-Apr-2026	Pending	AID-0011-SM-GRAPHIC-12		
DEL-AID-0014-SM-REELS-5	AID-0014	Mountain Bliss( Chetan Choudhari)	Reel	19-Apr-2026	Pending	AID-0014-SM-REELS-5		
DEL-AID-0015-SM-REELS-4	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Reel	19-Apr-2026	Pending	AID-0015-SM-REELS-4		
DEL-AID-0019-SM-GRAPHIC-4	AID-0019	Agri field (Satyajeet Patil)	Graphic	19-Apr-2026	Pending	AID-0019-SM-GRAPHIC-4		
DEL-AID-0017-SM-REELS-3	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Reel	20-Apr-2026	Pending	AID-0017-SM-REELS-3		
DEL-AID-0018-SM-REELS-3	AID-0018	Wellcare Pathology Laboratory(Pavan Shinde)	Reel	20-Apr-2026	Pending	AID-0018-SM-REELS-3		
DEL-AID-0022-SM-REELS-2	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	Reel	20-Apr-2026	Pending	AID-0022-SM-REELS-2		
DEL-AID-0024-SM-GRAPHIC-2	AID-0024	LIC Insurance	Graphic	20-Apr-2026	Pending	AID-0024-SM-GRAPHIC-2		
DEL-AID-0010-SM-POST-19	AID-0010	Socio-Political	Graphic	21-Apr-2026	Pending	AID-0010-SM-POST-19		
DEL-AID-0011-SM-GRAPHIC-13	AID-0011	Sanskruti Pre School	Graphic	21-Apr-2026	Pending	AID-0011-SM-GRAPHIC-13		
DEL-AID-0015-SM-REELS-5	AID-0015	SM Multi Feet Car Services(Mahantesh Birajdar)	Reel	21-Apr-2026	Pending	AID-0015-SM-REELS-5		
DEL-AID-0019-SM-REELS-3	AID-0019	Agri field (Satyajeet Patil)	Reel	21-Apr-2026	Pending	AID-0019-SM-REELS-3		
DEL-AID-0023-SM-AI-VIDEOS-1	AID-0023	Dr. Sneha's PhysioTech	AI Video	21-Apr-2026	Pending	AID-0023-SM-AI-VIDEOS-1		
DEL-AID-0017-SM-GRAPHIC-6	AID-0017	Kadambari's homeopathic wellness center(kadambari chavan)	Graphic	22-Apr-2026	Pending	AID-0017-SM-GRAPHIC-6		
DEL-AID-0022-SM-GRAPHIC-4	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	Graphic	22-Apr-2026	Pending	AID-0022-SM-GRAPHIC-4		
DEL-AID-0023-SM-GRAPHIC-3	AID-0023	Dr. Sneha's PhysioTech	Graphic	22-Apr-2026	Pending	AID-0023-SM-GRAPHIC-3		
DEL-AID-0025-SM-GRAPHIC-1	AID-0025	Adishree Legal	Graphic	22-Apr-2026	Pending	AID-0025-SM-GRAPHIC-1		
DEL-AID-0010-SM-POST-20	AID-0010	Socio-Political	Graphic	23-Apr-2026	Pending	AID-0010-SM-POST-20		
DEL-AID-0011-SM-GRAPHIC-14	AID-0011	Sanskruti Pre School	Graphic	23-Apr-2026	Pending	AID-0011-SM-GRAPHIC-14		
DEL-AID-0024-SM-AI-VIDEOS-1	AID-0024	LIC Insurance	AI Video	23-Apr-2026	Pending	AID-0024-SM-AI-VIDEOS-1		
DEL-AID-0022-SM-REELS-3	AID-0022	Kaavya Beauty Parlour(kalpana Daud)	Reel	24-Apr-2026	Pending	AID-0022-SM-REELS-3		
DEL-AID-0023-SM-REELS-2	AID-0023	Dr. Sneha's PhysioTech	Reel	24-Apr-2026	Pending	AID-0023-SM-REELS-2		
DEL-AID-0024-SM-GRAPHIC-3	AID-0024	LIC Insurance	Graphic	24-Apr-2026	Pending	AID-0024-SM-GRAPHIC-3		
DEL-AID-0025-SM-REELS-1	AID-0025	Adishree Legal	Reel	24-Apr-2026	Pending	AID-0025-SM-REELS-1		
DEL-AID-0011-SM-GRAPHIC-15	AID-0011	Sanskruti Pre School	Graphic	25-Apr-2026	Pending	AID-0011-SM-GRAPHIC-15		
DEL-AID-0026-SM-GRAPHIC-1	AID-0026	AS Account Solution	Graphic	25-Apr-2026	Pending	AID-0026-SM-GRAPHIC-1		
DEL-AID-0027-SM-GRAPHIC-1	AID-0027	Refurbished Technologies pvt Ltd	Graphic	25-Apr-2026	Pending	AID-0027-SM-GRAPHIC-1		
DEL-AID-0023-SM-GRAPHIC-4	AID-0023	Dr. Sneha's PhysioTech	Graphic	26-Apr-2026	Pending	AID-0023-SM-GRAPHIC-4		
DEL-AID-0024-SM-REELS-2	AID-0024	LIC Insurance	Reel	26-Apr-2026	Pending	AID-0024-SM-REELS-2		
DEL-AID-0025-SM-GRAPHIC-2	AID-0025	Adishree Legal	Graphic	26-Apr-2026	Pending	AID-0025-SM-GRAPHIC-2		
DEL-AID-0011-SM-GRAPHIC-16	AID-0011	Sanskruti Pre School	Graphic	27-Apr-2026	Pending	AID-0011-SM-GRAPHIC-16		
DEL-AID-0026-SM-REELS-1	AID-0026	AS Account Solution	Reel	27-Apr-2026	Pending	AID-0026-SM-REELS-1		
DEL-AID-0027-SM-REELS-1	AID-0027	Refurbished Technologies pvt Ltd	Reel	27-Apr-2026	Pending	AID-0027-SM-REELS-1		
DEL-AID-0023-SM-REELS-3	AID-0023	Dr. Sneha's PhysioTech	Reel	28-Apr-2026	Pending	AID-0023-SM-REELS-3		
DEL-AID-0024-SM-GRAPHIC-4	AID-0024	LIC Insurance	Graphic	28-Apr-2026	Pending	AID-0024-SM-GRAPHIC-4		
DEL-AID-0028-SM-GRAPHIC-1	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	Graphic	28-Apr-2026	Pending	AID-0028-SM-GRAPHIC-1		
DEL-AID-0011-SM-GRAPHIC-17	AID-0011	Sanskruti Pre School	Graphic	29-Apr-2026	Pending	AID-0011-SM-GRAPHIC-17		
DEL-AID-0025-SM-AI-VIDEOS-1	AID-0025	Adishree Legal	AI Video	29-Apr-2026	Pending	AID-0025-SM-AI-VIDEOS-1		
DEL-AID-0026-SM-GRAPHIC-2	AID-0026	AS Account Solution	Graphic	29-Apr-2026	Pending	AID-0026-SM-GRAPHIC-2		
DEL-AID-0027-SM-GRAPHIC-2	AID-0027	Refurbished Technologies pvt Ltd	Graphic	29-Apr-2026	Pending	AID-0027-SM-GRAPHIC-2		
DEL-AID-0029-SM-GRAPHIC-1	AID-0029	Krish Metal	Graphic	29-Apr-2026	Pending	AID-0029-SM-GRAPHIC-1		
DEL-AID-0024-SM-REELS-3	AID-0024	LIC Insurance	Reel	30-Apr-2026	Pending	AID-0024-SM-REELS-3		
DEL-AID-0025-SM-GRAPHIC-3	AID-0025	Adishree Legal	Graphic	30-Apr-2026	Pending	AID-0025-SM-GRAPHIC-3		
DEL-AID-0028-SM-REELS-1	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	Reel	30-Apr-2026	Pending	AID-0028-SM-REELS-1		
DEL-AID-0030-SM-GRAPHIC-1	AID-0030	Junior Abacus	Graphic	30-Apr-2026	Pending	AID-0030-SM-GRAPHIC-1		
DEL-AID-0031-SM-GRAPHIC-1	AID-0031	National Institute	Graphic	30-Apr-2026	Pending	AID-0031-SM-GRAPHIC-1		
DEL-AID-0032-SM-GRAPHIC-1	AID-0032	The Global Academy	Graphic	30-Apr-2026	Pending	AID-0032-SM-GRAPHIC-1		
DEL-AID-0011-SM-GRAPHIC-18	AID-0011	Sanskruti Pre School	Graphic	01-May-2026	Pending	AID-0011-SM-GRAPHIC-18		
DEL-AID-0029-SM-REELS-1	AID-0029	Krish Metal	Reel	01-May-2026	Pending	AID-0029-SM-REELS-1		
DEL-AID-0033-SM-GRAPHIC-1	AID-0033	Adarsh Tution Classes	Graphic	01-May-2026	Pending	AID-0033-SM-GRAPHIC-1		
DEL-AID-0034-SM-GRAPHIC-1	AID-0034	Hayun solutions pvt ltd	Graphic	01-May-2026	Pending	AID-0034-SM-GRAPHIC-1		
DEL-AID-0025-SM-REELS-2	AID-0025	Adishree Legal	Reel	02-May-2026	Pending	AID-0025-SM-REELS-2		
DEL-AID-0026-SM-AI-VIDEOS-1	AID-0026	AS Account Solution	AI Video	02-May-2026	Pending	AID-0026-SM-AI-VIDEOS-1		
DEL-AID-0027-SM-AI-VIDEOS-1	AID-0027	Refurbished Technologies pvt Ltd	AI Video	02-May-2026	Pending	AID-0027-SM-AI-VIDEOS-1		
DEL-AID-0028-SM-GRAPHIC-2	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	Graphic	02-May-2026	Pending	AID-0028-SM-GRAPHIC-2		
DEL-AID-0030-SM-REELS-1	AID-0030	Junior Abacus	Reel	02-May-2026	Pending	AID-0030-SM-REELS-1		
DEL-AID-0031-SM-REELS-1	AID-0031	National Institute	Reel	02-May-2026	Pending	AID-0031-SM-REELS-1		
DEL-AID-0032-SM-REELS-1	AID-0032	The Global Academy	Reel	02-May-2026	Pending	AID-0032-SM-REELS-1		
DEL-AID-0035-SM-GRAPHIC-1	AID-0035	Dr.Rajguru Hair Care Clinic	Graphic	02-May-2026	Pending	AID-0035-SM-GRAPHIC-1		
DEL-AID-0011-SM-GRAPHIC-19	AID-0011	Sanskruti Pre School	Graphic	03-May-2026	Pending	AID-0011-SM-GRAPHIC-19		
DEL-AID-0026-SM-GRAPHIC-3	AID-0026	AS Account Solution	Graphic	03-May-2026	Pending	AID-0026-SM-GRAPHIC-3		
DEL-AID-0027-SM-GRAPHIC-3	AID-0027	Refurbished Technologies pvt Ltd	Graphic	03-May-2026	Pending	AID-0027-SM-GRAPHIC-3		
DEL-AID-0029-SM-GRAPHIC-2	AID-0029	Krish Metal	Graphic	03-May-2026	Pending	AID-0029-SM-GRAPHIC-2		
DEL-AID-0033-SM-REELS-1	AID-0033	Adarsh Tution Classes	Reel	03-May-2026	Pending	AID-0033-SM-REELS-1		
DEL-AID-0034-SM-REELS-1	AID-0034	Hayun solutions pvt ltd	Reel	03-May-2026	Pending	AID-0034-SM-REELS-1		
DEL-AID-0036-SM-GRAPHIC-1	AID-0036	Studio Max	Graphic	03-May-2026	Pending	AID-0036-SM-GRAPHIC-1		
DEL-AID-0025-SM-GRAPHIC-4	AID-0025	Adishree Legal	Graphic	04-May-2026	Pending	AID-0025-SM-GRAPHIC-4		
DEL-AID-0030-SM-GRAPHIC-2	AID-0030	Junior Abacus	Graphic	04-May-2026	Pending	AID-0030-SM-GRAPHIC-2		
DEL-AID-0031-SM-GRAPHIC-2	AID-0031	National Institute	Graphic	04-May-2026	Pending	AID-0031-SM-GRAPHIC-2		
DEL-AID-0032-SM-GRAPHIC-2	AID-0032	The Global Academy	Graphic	04-May-2026	Pending	AID-0032-SM-GRAPHIC-2		
DEL-AID-0035-SM-REELS-1	AID-0035	Dr.Rajguru Hair Care Clinic	Reel	04-May-2026	Pending	AID-0035-SM-REELS-1		
DEL-AID-0011-SM-GRAPHIC-20	AID-0011	Sanskruti Pre School	Graphic	05-May-2026	Pending	AID-0011-SM-GRAPHIC-20		
DEL-AID-0026-SM-REELS-2	AID-0026	AS Account Solution	Reel	05-May-2026	Pending	AID-0026-SM-REELS-2		
DEL-AID-0027-SM-REELS-2	AID-0027	Refurbished Technologies pvt Ltd	Reel	05-May-2026	Pending	AID-0027-SM-REELS-2		
DEL-AID-0028-SM-AI-VIDEOS-1	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	AI Video	05-May-2026	Pending	AID-0028-SM-AI-VIDEOS-1		
DEL-AID-0033-SM-GRAPHIC-2	AID-0033	Adarsh Tution Classes	Graphic	05-May-2026	Pending	AID-0033-SM-GRAPHIC-2		
DEL-AID-0034-SM-GRAPHIC-2	AID-0034	Hayun solutions pvt ltd	Graphic	05-May-2026	Pending	AID-0034-SM-GRAPHIC-2		
DEL-AID-0036-SM-REELS-1	AID-0036	Studio Max	Reel	05-May-2026	Pending	AID-0036-SM-REELS-1		
DEL-AID-0028-SM-GRAPHIC-3	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	Graphic	06-May-2026	Pending	AID-0028-SM-GRAPHIC-3		
DEL-AID-0029-SM-AI-VIDEOS-1	AID-0029	Krish Metal	AI Video	06-May-2026	Pending	AID-0029-SM-AI-VIDEOS-1		
DEL-AID-0035-SM-GRAPHIC-2	AID-0035	Dr.Rajguru Hair Care Clinic	Graphic	06-May-2026	Pending	AID-0035-SM-GRAPHIC-2		
DEL-AID-0037-SM-GRAPHIC-1	AID-0037	Janmbhumi Industries	Graphic	06-May-2026	Pending	AID-0037-SM-GRAPHIC-1		
DEL-AID-0011-SM-GRAPHIC-21	AID-0011	Sanskruti Pre School	Graphic	07-May-2026	Pending	AID-0011-SM-GRAPHIC-21		
DEL-AID-0025-SM-AI-VIDEOS-2	AID-0025	Adishree Legal	AI Video	07-May-2026	Pending	AID-0025-SM-AI-VIDEOS-2		
DEL-AID-0026-SM-GRAPHIC-4	AID-0026	AS Account Solution	Graphic	07-May-2026	Pending	AID-0026-SM-GRAPHIC-4		
DEL-AID-0027-SM-GRAPHIC-4	AID-0027	Refurbished Technologies pvt Ltd	Graphic	07-May-2026	Pending	AID-0027-SM-GRAPHIC-4		
DEL-AID-0029-SM-GRAPHIC-3	AID-0029	Krish Metal	Graphic	07-May-2026	Pending	AID-0029-SM-GRAPHIC-3		
DEL-AID-0030-SM-AI-VIDEOS-1	AID-0030	Junior Abacus	AI Video	07-May-2026	Pending	AID-0030-SM-AI-VIDEOS-1		
DEL-AID-0031-SM-AI-VIDEOS-1	AID-0031	National Institute	AI Video	07-May-2026	Pending	AID-0031-SM-AI-VIDEOS-1		
DEL-AID-0032-SM-AI-VIDEOS-1	AID-0032	The Global Academy	AI Video	07-May-2026	Pending	AID-0032-SM-AI-VIDEOS-1		
DEL-AID-0036-SM-GRAPHIC-2	AID-0036	Studio Max	Graphic	07-May-2026	Pending	AID-0036-SM-GRAPHIC-2		
DEL-AID-0025-SM-REELS-3	AID-0025	Adishree Legal	Reel	08-May-2026	Pending	AID-0025-SM-REELS-3		
DEL-AID-0028-SM-REELS-2	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	Reel	08-May-2026	Pending	AID-0028-SM-REELS-2		
DEL-AID-0030-SM-GRAPHIC-3	AID-0030	Junior Abacus	Graphic	08-May-2026	Pending	AID-0030-SM-GRAPHIC-3		
DEL-AID-0031-SM-GRAPHIC-3	AID-0031	National Institute	Graphic	08-May-2026	Pending	AID-0031-SM-GRAPHIC-3		
DEL-AID-0032-SM-GRAPHIC-3	AID-0032	The Global Academy	Graphic	08-May-2026	Pending	AID-0032-SM-GRAPHIC-3		
DEL-AID-0033-SM-AI-VIDEOS-1	AID-0033	Adarsh Tution Classes	AI Video	08-May-2026	Pending	AID-0033-SM-AI-VIDEOS-1		
DEL-AID-0034-SM-AI-VIDEOS-1	AID-0034	Hayun solutions pvt ltd	AI Video	08-May-2026	Pending	AID-0034-SM-AI-VIDEOS-1		
DEL-AID-0037-SM-REELS-1	AID-0037	Janmbhumi Industries	Reel	08-May-2026	Pending	AID-0037-SM-REELS-1		
DEL-AID-0043-AI-POST-1	AID-0043	Trith International School	AI Video	08-May-2026	Pending	AID-0043-AI-POST-1		
DEL-AID-0011-SM-GRAPHIC-22	AID-0011	Sanskruti Pre School	Graphic	09-May-2026	Pending	AID-0011-SM-GRAPHIC-22		
DEL-AID-0026-SM-REELS-3	AID-0026	AS Account Solution	Reel	09-May-2026	Pending	AID-0026-SM-REELS-3		
DEL-AID-0027-SM-REELS-3	AID-0027	Refurbished Technologies pvt Ltd	Reel	09-May-2026	Pending	AID-0027-SM-REELS-3		
DEL-AID-0029-SM-REELS-2	AID-0029	Krish Metal	Reel	09-May-2026	Pending	AID-0029-SM-REELS-2		
DEL-AID-0033-SM-GRAPHIC-3	AID-0033	Adarsh Tution Classes	Graphic	09-May-2026	Pending	AID-0033-SM-GRAPHIC-3		
DEL-AID-0034-SM-GRAPHIC-3	AID-0034	Hayun solutions pvt ltd	Graphic	09-May-2026	Pending	AID-0034-SM-GRAPHIC-3		
DEL-AID-0035-SM-AI-VIDEOS-1	AID-0035	Dr.Rajguru Hair Care Clinic	AI Video	09-May-2026	Pending	AID-0035-SM-AI-VIDEOS-1		
DEL-AID-0038-SM-GRAPHIC-1	AID-0038	Swamini Tours	Graphic	09-May-2026	Pending	AID-0038-SM-GRAPHIC-1		
DEL-AID-0039-SM-GRAPHIC-1	AID-0039	Perfect Plot Realty	Graphic	09-May-2026	Pending	AID-0039-SM-GRAPHIC-1		
DEL-AID-0040-SM-GRAPHIC-1	AID-0040	Soft Skill Techology	Graphic	09-May-2026	Pending	AID-0040-SM-GRAPHIC-1		
DEL-AID-0046-SM-POST-1	AID-0046	KodeWitz	Graphic	09-May-2026	Pending	AID-0046-SM-POST-1		
DEL-AID-0028-SM-GRAPHIC-4	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	Graphic	10-May-2026	Pending	AID-0028-SM-GRAPHIC-4		
DEL-AID-0030-SM-REELS-2	AID-0030	Junior Abacus	Reel	10-May-2026	Pending	AID-0030-SM-REELS-2		
DEL-AID-0031-SM-REELS-2	AID-0031	National Institute	Reel	10-May-2026	Pending	AID-0031-SM-REELS-2		
DEL-AID-0032-SM-REELS-2	AID-0032	The Global Academy	Reel	10-May-2026	Pending	AID-0032-SM-REELS-2		
DEL-AID-0035-SM-GRAPHIC-3	AID-0035	Dr.Rajguru Hair Care Clinic	Graphic	10-May-2026	Pending	AID-0035-SM-GRAPHIC-3		
DEL-AID-0036-SM-AI-VIDEOS-1	AID-0036	Studio Max	AI Video	10-May-2026	Pending	AID-0036-SM-AI-VIDEOS-1		
DEL-AID-0037-SM-GRAPHIC-2	AID-0037	Janmbhumi Industries	Graphic	10-May-2026	Pending	AID-0037-SM-GRAPHIC-2		
DEL-AID-0011-SM-GRAPHIC-23	AID-0011	Sanskruti Pre School	Graphic	11-May-2026	Pending	AID-0011-SM-GRAPHIC-23		
DEL-AID-0025-SM-AI-VIDEOS-3	AID-0025	Adishree Legal	AI Video	11-May-2026	Pending	AID-0025-SM-AI-VIDEOS-3		
DEL-AID-0029-SM-GRAPHIC-4	AID-0029	Krish Metal	Graphic	11-May-2026	Pending	AID-0029-SM-GRAPHIC-4		
DEL-AID-0033-SM-REELS-2	AID-0033	Adarsh Tution Classes	Reel	11-May-2026	Pending	AID-0033-SM-REELS-2		
DEL-AID-0034-SM-REELS-2	AID-0034	Hayun solutions pvt ltd	Reel	11-May-2026	Pending	AID-0034-SM-REELS-2		
DEL-AID-0036-SM-GRAPHIC-3	AID-0036	Studio Max	Graphic	11-May-2026	Pending	AID-0036-SM-GRAPHIC-3		
DEL-AID-0038-SM-REELS-1	AID-0038	Swamini Tours	Reel	11-May-2026	Pending	AID-0038-SM-REELS-1		
DEL-AID-0039-SM-REELS-1	AID-0039	Perfect Plot Realty	Reel	11-May-2026	Pending	AID-0039-SM-REELS-1		
DEL-AID-0040-SM-REELS-1	AID-0040	Soft Skill Techology	Reel	11-May-2026	Pending	AID-0040-SM-REELS-1		
DEL-AID-0041-SM-GRAPHIC-1	AID-0041	Apple Multispeciality	Graphic	11-May-2026	Pending	AID-0041-SM-GRAPHIC-1		
DEL-AID-0042-SM-GRAPHIC-1	AID-0042	Trith International School	Graphic	11-May-2026	Pending	AID-0042-SM-GRAPHIC-1		
DEL-AID-0046-SM-POST-2	AID-0046	KodeWitz	Graphic	11-May-2026	Pending	AID-0046-SM-POST-2		
DEL-AID-0025-SM-REELS-4	AID-0025	Adishree Legal	Reel	12-May-2026	Pending	AID-0025-SM-REELS-4		
DEL-AID-0028-SM-REELS-3	AID-0028	PRIMESWIFT SOLUTIONS PRIVATE LIMITED	Reel	12-May-2026	Pending	AID-0028-SM-REELS-3		
DEL-AID-0030-SM-GRAPHIC-4	AID-0030	Junior Abacus	Graphic	12-May-2026	Pending	AID-0030-SM-GRAPHIC-4		
DEL-AID-0031-SM-GRAPHIC-4	AID-0031	National Institute	Graphic	12-May-2026	Pending	AID-0031-SM-GRAPHIC-4		
DEL-AID-0032-SM-GRAPHIC-4	AID-0032	The Global Academy	Graphic	12-May-2026	Pending	AID-0032-SM-GRAPHIC-4		
DEL-AID-0035-SM-REELS-2	AID-0035	Dr.Rajguru Hair Care Clinic	Reel	12-May-2026	Pending	AID-0035-SM-REELS-2		
DEL-AID-0043-AI-POST-2	AID-0043	Trith International School	AI Video	12-May-2026	Pending	AID-0043-AI-POST-2		
DEL-AID-0044-SM-GRAPHIC-1	AID-0044	LockYourIdea IP	Graphic	12-May-2026	Pending	AID-0044-SM-GRAPHIC-1		
DEL-AID-0011-SM-GRAPHIC-24	AID-0011	Sanskruti Pre School	Graphic	13-May-2026	Pending	AID-0011-SM-GRAPHIC-24		
DEL-AID-0029-SM-REELS-3	AID-0029	Krish Metal	Reel	13-May-2026	Pending	AID-0029-SM-REELS-3		
DEL-AID-0033-SM-GRAPHIC-4	AID-0033	Adarsh Tution Classes	Graphic	13-May-2026	Pending	AID-0033-SM-GRAPHIC-4		
DEL-AID-0034-SM-GRAPHIC-4	AID-0034	Hayun solutions pvt ltd	Graphic	13-May-2026	Pending	AID-0034-SM-GRAPHIC-4		
DEL-AID-0036-SM-REELS-2	AID-0036	Studio Max	Reel	13-May-2026	Pending	AID-0036-SM-REELS-2		
DEL-AID-0037-SM-AI-VIDEOS-1	AID-0037	Janmbhumi Industries	AI Video	13-May-2026	Pending	AID-0037-SM-AI-VIDEOS-1		
DEL-AID-0038-SM-GRAPHIC-2	AID-0038	Swamini Tours	Graphic	13-May-2026	Pending	AID-0038-SM-GRAPHIC-2		
DEL-AID-0039-SM-GRAPHIC-2	AID-0039	Perfect Plot Realty	Graphic	13-May-2026	Pending	AID-0039-SM-GRAPHIC-2		
DEL-AID-0040-SM-GRAPHIC-2	AID-0040	Soft Skill Techology	Graphic	13-May-2026	Pending	AID-0040-SM-GRAPHIC-2		
DEL-AID-0041-SM-REELS-1	AID-0041	Apple Multispeciality	Reel	13-May-2026	Pending	AID-0041-SM-REELS-1		
DEL-AID-0042-SM-REELS-1	AID-0042	Trith International School	Reel	13-May-2026	Pending	AID-0042-SM-REELS-1		
DEL-AID-0045-SM-GRAPHIC-1	AID-0045	LockYourIdea AI Video	Graphic	13-May-2026	Pending	AID-0045-SM-GRAPHIC-1		
DEL-AID-0046-SM-POST-3	AID-0046	KodeWitz	Graphic	13-May-2026	Pending	AID-0046-SM-POST-3		
DEL-AID-0047-SM-GRAPHIC-1	AID-0047	Little Genius Playschool	Graphic	13-May-2026	Pending	AID-0047-SM-GRAPHIC-1		
DEL-AID-0030-SM-REELS-3	AID-0030	Junior Abacus	Reel	14-May-2026	Pending	AID-0030-SM-REELS-3		
DEL-AID-0031-SM-REELS-3	AID-0031	National Institute	Reel	14-May-2026	Pending	AID-0031-SM-REELS-3		
DEL-AID-0032-SM-REELS-3	AID-0032	The Global Academy	Reel	14-May-2026	Pending	AID-0032-SM-REELS-3		
DEL-AID-0035-SM-GRAPHIC-4	AID-0035	Dr.Rajguru Hair Care Clinic	Graphic	14-May-2026	Pending	AID-0035-SM-GRAPHIC-4		
DEL-AID-0037-SM-GRAPHIC-3	AID-0037	Janmbhumi Industries	Graphic	14-May-2026	Pending	AID-0037-SM-GRAPHIC-3		
DEL-AID-0044-SM-REELS-1	AID-0044	LockYourIdea IP	Reel	14-May-2026	Pending	AID-0044-SM-REELS-1		
DEL-AID-0048-SM-GRAPHIC-1	AID-0048	Adly App	Graphic	14-May-2026	Pending	AID-0048-SM-GRAPHIC-1		
DEL-AID-0025-SM-AI-VIDEOS-4	AID-0025	Adishree Legal	AI Video	15-May-2026	Pending	AID-0025-SM-AI-VIDEOS-4		
DEL-AID-0033-SM-REELS-3	AID-0033	Adarsh Tution Classes	Reel	15-May-2026	Pending	AID-0033-SM-REELS-3		
DEL-AID-0034-SM-REELS-3	AID-0034	Hayun solutions pvt ltd	Reel	15-May-2026	Pending	AID-0034-SM-REELS-3		
DEL-AID-0036-SM-GRAPHIC-4	AID-0036	Studio Max	Graphic	15-May-2026	Pending	AID-0036-SM-GRAPHIC-4		
DEL-AID-0041-SM-GRAPHIC-2	AID-0041	Apple Multispeciality	Graphic	15-May-2026	Pending	AID-0041-SM-GRAPHIC-2		
DEL-AID-0042-SM-GRAPHIC-2	AID-0042	Trith International School	Graphic	15-May-2026	Pending	AID-0042-SM-GRAPHIC-2		
DEL-AID-0045-SM-REELS-1	AID-0045	LockYourIdea AI Video	Reel	15-May-2026	Pending	AID-0045-SM-REELS-1		
DEL-AID-0046-SM-POST-4	AID-0046	KodeWitz	Graphic	15-May-2026	Pending	AID-0046-SM-POST-4		
DEL-AID-0047-SM-REELS-1	AID-0047	Little Genius Playschool	Reel	15-May-2026	Pending	AID-0047-SM-REELS-1		
DEL-AID-0025-SM-REELS-5	AID-0025	Adishree Legal	Reel	16-May-2026	Pending	AID-0025-SM-REELS-5		
DEL-AID-0035-SM-REELS-3	AID-0035	Dr.Rajguru Hair Care Clinic	Reel	16-May-2026	Pending	AID-0035-SM-REELS-3		
DEL-AID-0037-SM-REELS-2	AID-0037	Janmbhumi Industries	Reel	16-May-2026	Pending	AID-0037-SM-REELS-2		
DEL-AID-0038-SM-AI-VIDEOS-1	AID-0038	Swamini Tours	AI Video	16-May-2026	Pending	AID-0038-SM-AI-VIDEOS-1		
DEL-AID-0039-SM-AI-VIDEOS-1	AID-0039	Perfect Plot Realty	AI Video	16-May-2026	Pending	AID-0039-SM-AI-VIDEOS-1		
DEL-AID-0040-SM-AI-VIDEOS-1	AID-0040	Soft Skill Techology	AI Video	16-May-2026	Pending	AID-0040-SM-AI-VIDEOS-1		
DEL-AID-0043-AI-POST-3	AID-0043	Trith International School	AI Video	16-May-2026	Pending	AID-0043-AI-POST-3		
DEL-AID-0044-SM-GRAPHIC-2	AID-0044	LockYourIdea IP	Graphic	16-May-2026	Pending	AID-0044-SM-GRAPHIC-2		
DEL-AID-0048-SM-REELS-1	AID-0048	Adly App	Reel	16-May-2026	Pending	AID-0048-SM-REELS-1		
DEL-AID-0036-SM-REELS-3	AID-0036	Studio Max	Reel	17-May-2026	Pending	AID-0036-SM-REELS-3		
DEL-AID-0038-SM-GRAPHIC-3	AID-0038	Swamini Tours	Graphic	17-May-2026	Pending	AID-0038-SM-GRAPHIC-3		
DEL-AID-0039-SM-GRAPHIC-3	AID-0039	Perfect Plot Realty	Graphic	17-May-2026	Pending	AID-0039-SM-GRAPHIC-3		
DEL-AID-0040-SM-GRAPHIC-3	AID-0040	Soft Skill Techology	Graphic	17-May-2026	Pending	AID-0040-SM-GRAPHIC-3		
DEL-AID-0045-SM-GRAPHIC-2	AID-0045	LockYourIdea AI Video	Graphic	17-May-2026	Pending	AID-0045-SM-GRAPHIC-2		
DEL-AID-0046-SM-POST-5	AID-0046	KodeWitz	Graphic	17-May-2026	Pending	AID-0046-SM-POST-5		
DEL-AID-0047-SM-GRAPHIC-2	AID-0047	Little Genius Playschool	Graphic	17-May-2026	Pending	AID-0047-SM-GRAPHIC-2		
DEL-AID-0037-SM-GRAPHIC-4	AID-0037	Janmbhumi Industries	Graphic	18-May-2026	Pending	AID-0037-SM-GRAPHIC-4		
DEL-AID-0041-SM-AI-VIDEOS-1	AID-0041	Apple Multispeciality	AI Video	18-May-2026	Pending	AID-0041-SM-AI-VIDEOS-1		
DEL-AID-0042-SM-AI-VIDEOS-1	AID-0042	Trith International School	AI Video	18-May-2026	Pending	AID-0042-SM-AI-VIDEOS-1		
DEL-AID-0048-SM-GRAPHIC-2	AID-0048	Adly App	Graphic	18-May-2026	Pending	AID-0048-SM-GRAPHIC-2		
DEL-AID-0049-SM-GRAPHIC-1	AID-0049	Viyom Financial	Graphic	18-May-2026	Pending	AID-0049-SM-GRAPHIC-1		
DEL-AID-0054-SM-POST-1	AID-0054	Align Interior	Graphic	18-May-2026	Pending	AID-0054-SM-POST-1		
DEL-AID-0038-SM-REELS-2	AID-0038	Swamini Tours	Reel	19-May-2026	Pending	AID-0038-SM-REELS-2		
DEL-AID-0039-SM-REELS-2	AID-0039	Perfect Plot Realty	Reel	19-May-2026	Pending	AID-0039-SM-REELS-2		
DEL-AID-0040-SM-REELS-2	AID-0040	Soft Skill Techology	Reel	19-May-2026	Pending	AID-0040-SM-REELS-2		
DEL-AID-0041-SM-GRAPHIC-3	AID-0041	Apple Multispeciality	Graphic	19-May-2026	Pending	AID-0041-SM-GRAPHIC-3		
DEL-AID-0042-SM-GRAPHIC-3	AID-0042	Trith International School	Graphic	19-May-2026	Pending	AID-0042-SM-GRAPHIC-3		
DEL-AID-0044-SM-AI-VIDEOS-1	AID-0044	LockYourIdea IP	AI Video	19-May-2026	Pending	AID-0044-SM-AI-VIDEOS-1		
DEL-AID-0050-SM-GRAPHIC-1	AID-0050	Gurukul	Graphic	19-May-2026	Pending	AID-0050-SM-GRAPHIC-1		
DEL-AID-0055-SM-POST-1	AID-0055	SR auto systems(Vaibhav jadhav)	Graphic	19-May-2026	Pending	AID-0055-SM-POST-1		
DEL-AID-0037-SM-REELS-3	AID-0037	Janmbhumi Industries	Reel	20-May-2026	Pending	AID-0037-SM-REELS-3		
DEL-AID-0043-AI-POST-4	AID-0043	Trith International School	AI Video	20-May-2026	Pending	AID-0043-AI-POST-4		
DEL-AID-0044-SM-GRAPHIC-3	AID-0044	LockYourIdea IP	Graphic	20-May-2026	Pending	AID-0044-SM-GRAPHIC-3		
DEL-AID-0045-SM-AI-VIDEOS-1	AID-0045	LockYourIdea AI Video	AI Video	20-May-2026	Pending	AID-0045-SM-AI-VIDEOS-1		
DEL-AID-0047-SM-AI-VIDEOS-1	AID-0047	Little Genius Playschool	AI Video	20-May-2026	Pending	AID-0047-SM-AI-VIDEOS-1		
DEL-AID-0049-SM-REELS-1	AID-0049	Viyom Financial	Reel	20-May-2026	Pending	AID-0049-SM-REELS-1		
DEL-AID-0051-SM-GRAPHIC-1	AID-0051	UPSC Decode	Graphic	20-May-2026	Pending	AID-0051-SM-GRAPHIC-1		
DEL-AID-0052-SM-GRAPHIC-1	AID-0052	LIC	Graphic	20-May-2026	Pending	AID-0052-SM-GRAPHIC-1		
DEL-AID-0054-SM-POST-2	AID-0054	Align Interior	Graphic	20-May-2026	Pending	AID-0054-SM-POST-2		
DEL-AID-0038-SM-GRAPHIC-4	AID-0038	Swamini Tours	Graphic	21-May-2026	Pending	AID-0038-SM-GRAPHIC-4		
DEL-AID-0039-SM-GRAPHIC-4	AID-0039	Perfect Plot Realty	Graphic	21-May-2026	Pending	AID-0039-SM-GRAPHIC-4		
DEL-AID-0040-SM-GRAPHIC-4	AID-0040	Soft Skill Techology	Graphic	21-May-2026	Pending	AID-0040-SM-GRAPHIC-4		
DEL-AID-0041-SM-REELS-2	AID-0041	Apple Multispeciality	Reel	21-May-2026	Pending	AID-0041-SM-REELS-2		
DEL-AID-0042-SM-REELS-2	AID-0042	Trith International School	Reel	21-May-2026	Pending	AID-0042-SM-REELS-2		
DEL-AID-0045-SM-GRAPHIC-3	AID-0045	LockYourIdea AI Video	Graphic	21-May-2026	Pending	AID-0045-SM-GRAPHIC-3		
DEL-AID-0047-SM-GRAPHIC-3	AID-0047	Little Genius Playschool	Graphic	21-May-2026	Pending	AID-0047-SM-GRAPHIC-3		
DEL-AID-0048-SM-AI-VIDEOS-1	AID-0048	Adly App	AI Video	21-May-2026	Pending	AID-0048-SM-AI-VIDEOS-1		
DEL-AID-0050-SM-REELS-1	AID-0050	Gurukul	Reel	21-May-2026	Pending	AID-0050-SM-REELS-1		
DEL-AID-0053-SM-GRAPHIC-1	AID-0053	Aarya Consruction	Graphic	21-May-2026	Pending	AID-0053-SM-GRAPHIC-1	Danish	
DEL-AID-0055-SM-POST-2	AID-0055	SR auto systems(Vaibhav jadhav)	Graphic	21-May-2026	Pending	AID-0055-SM-POST-2		
DEL-AID-0044-SM-REELS-2	AID-0044	LockYourIdea IP	Reel	22-May-2026	Pending	AID-0044-SM-REELS-2		
DEL-AID-0048-SM-GRAPHIC-3	AID-0048	Adly App	Graphic	22-May-2026	Pending	AID-0048-SM-GRAPHIC-3		
DEL-AID-0049-SM-GRAPHIC-2	AID-0049	Viyom Financial	Graphic	22-May-2026	Pending	AID-0049-SM-GRAPHIC-2		
DEL-AID-0051-SM-REELS-1	AID-0051	UPSC Decode	Reel	22-May-2026	Pending	AID-0051-SM-REELS-1		
DEL-AID-0052-SM-REELS-1	AID-0052	LIC	Reel	22-May-2026	Pending	AID-0052-SM-REELS-1		
DEL-AID-0054-SM-POST-3	AID-0054	Align Interior	Graphic	22-May-2026	Pending	AID-0054-SM-POST-3		
DEL-AID-0038-SM-REELS-3	AID-0038	Swamini Tours	Reel	23-May-2026	Pending	AID-0038-SM-REELS-3		
DEL-AID-0039-SM-REELS-3	AID-0039	Perfect Plot Realty	Reel	23-May-2026	Pending	AID-0039-SM-REELS-3		
DEL-AID-0040-SM-REELS-3	AID-0040	Soft Skill Techology	Reel	23-May-2026	Pending	AID-0040-SM-REELS-3		
DEL-AID-0041-SM-GRAPHIC-4	AID-0041	Apple Multispeciality	Graphic	23-May-2026	Pending	AID-0041-SM-GRAPHIC-4		
DEL-AID-0042-SM-GRAPHIC-4	AID-0042	Trith International School	Graphic	23-May-2026	Pending	AID-0042-SM-GRAPHIC-4		
DEL-AID-0045-SM-REELS-2	AID-0045	LockYourIdea AI Video	Reel	23-May-2026	Pending	AID-0045-SM-REELS-2		
DEL-AID-0047-SM-REELS-2	AID-0047	Little Genius Playschool	Reel	23-May-2026	Pending	AID-0047-SM-REELS-2		
DEL-AID-0050-SM-GRAPHIC-2	AID-0050	Gurukul	Graphic	23-May-2026	Pending	AID-0050-SM-GRAPHIC-2		
DEL-AID-0053-SM-REELS-1	AID-0053	Aarya Consruction	Reel	23-May-2026	Pending	AID-0053-SM-REELS-1	Sanmeet	
DEL-AID-0055-SM-POST-3	AID-0055	SR auto systems(Vaibhav jadhav)	Graphic	23-May-2026	Pending	AID-0055-SM-POST-3		
DEL-AID-0043-AI-POST-5	AID-0043	Trith International School	AI Video	24-May-2026	Pending	AID-0043-AI-POST-5		
DEL-AID-0044-SM-GRAPHIC-4	AID-0044	LockYourIdea IP	Graphic	24-May-2026	Pending	AID-0044-SM-GRAPHIC-4		
DEL-AID-0048-SM-REELS-2	AID-0048	Adly App	Reel	24-May-2026	Pending	AID-0048-SM-REELS-2		
DEL-AID-0051-SM-GRAPHIC-2	AID-0051	UPSC Decode	Graphic	24-May-2026	Pending	AID-0051-SM-GRAPHIC-2		
DEL-AID-0052-SM-GRAPHIC-2	AID-0052	LIC	Graphic	24-May-2026	Pending	AID-0052-SM-GRAPHIC-2		
DEL-AID-0054-SM-POST-4	AID-0054	Align Interior	Graphic	24-May-2026	Pending	AID-0054-SM-POST-4		
DEL-AID-0056-SM-GRAPHIC-1	AID-0056	Shree HR Services(Suraj Vhatkar )	Graphic	24-May-2026	Pending	AID-0056-SM-GRAPHIC-1		
DEL-AID-0041-SM-REELS-3	AID-0041	Apple Multispeciality	Reel	25-May-2026	Pending	AID-0041-SM-REELS-3		
DEL-AID-0042-SM-REELS-3	AID-0042	Trith International School	Reel	25-May-2026	Pending	AID-0042-SM-REELS-3		
DEL-AID-0045-SM-GRAPHIC-4	AID-0045	LockYourIdea AI Video	Graphic	25-May-2026	Pending	AID-0045-SM-GRAPHIC-4		
DEL-AID-0047-SM-GRAPHIC-4	AID-0047	Little Genius Playschool	Graphic	25-May-2026	Pending	AID-0047-SM-GRAPHIC-4		
DEL-AID-0049-SM-AI-VIDEOS-1	AID-0049	Viyom Financial	AI Video	25-May-2026	Pending	AID-0049-SM-AI-VIDEOS-1		
DEL-AID-0053-SM-GRAPHIC-2	AID-0053	Aarya Consruction	Graphic	25-May-2026	Pending	AID-0053-SM-GRAPHIC-2	Danish	
DEL-AID-0044-SM-REELS-3	AID-0044	LockYourIdea IP	Reel	26-May-2026	Pending	AID-0044-SM-REELS-3		
DEL-AID-0048-SM-GRAPHIC-4	AID-0048	Adly App	Graphic	26-May-2026	Pending	AID-0048-SM-GRAPHIC-4		
DEL-AID-0049-SM-GRAPHIC-3	AID-0049	Viyom Financial	Graphic	26-May-2026	Pending	AID-0049-SM-GRAPHIC-3		
DEL-AID-0050-SM-AI-VIDEOS-1	AID-0050	Gurukul	AI Video	26-May-2026	Pending	AID-0050-SM-AI-VIDEOS-1		
DEL-AID-0054-SM-POST-5	AID-0054	Align Interior	Graphic	26-May-2026	Pending	AID-0054-SM-POST-5		
DEL-AID-0056-SM-REELS-1	AID-0056	Shree HR Services(Suraj Vhatkar )	Reel	26-May-2026	Pending	AID-0056-SM-REELS-1		
DEL-AID-0057-SM-GRAPHIC-1	AID-0057	Hayat Enterprises(Humayum Sayyed )	Graphic	26-May-2026	Pending	AID-0057-SM-GRAPHIC-1		
DEL-AID-0058-AI-POST-1	AID-0058	Hotel Al Gulzar	AI Video	26-May-2026	Pending	AID-0058-AI-POST-1		
DEL-AID-0020-SM-GRAPHIC-1	AID-0020	Mack Agro Private L`;

export async function GET(req) {
  try {
    const lines = rawData.trim().split('\n');
    const header = lines[0].split('\t').map(h => h.trim());
    
    // We expect headers: Delivery ID, Client ID, Client Name, Post Type, Post Date, Status, Linked Task ID, Working On, Notes
    const deliveries = lines.slice(1).map(line => {
      const parts = line.split('\t');
      return {
        deliveryId: parts[0] || '',
        clientId: parts[1] || '',
        clientName: parts[2] || '',
        postType: parts[3] || '',
        postDate: parts[4] || '',
        status: parts[5] || 'Pending',
        linkedTaskId: parts[6] || null,
        workingOn: parts[7] || null,
        notes: parts[8] || null
      };
    });

    let clientsCreated = 0;
    let deliveriesCreated = 0;

    for (const d of deliveries) {
      if (!d.clientId) continue;

      // Ensure client exists first to prevent foreign key issues
      const existingClient = await prisma.client.findUnique({
        where: { clientId: d.clientId }
      });
      
      if (!existingClient) {
        await prisma.client.create({
          data: {
            clientId: d.clientId,
            businessName: d.clientName || `Business ${d.clientId}`,
            clientName: `Contact ${d.clientId}`,
            joiningDate: new Date().toISOString().split('T')[0],
            services: 'Meta Ads',
            packageName: 'Standard',
            packageAmount: 2000,
            accountReady: true,
            active: true
          }
        });
        clientsCreated++;
      }

      // Upsert delivery
      await prisma.clientDelivery.upsert({
        where: { deliveryId: d.deliveryId },
        update: {
          clientId: d.clientId,
          clientName: d.clientName,
          postType: d.postType,
          postDate: d.postDate,
          status: d.status,
          linkedTaskId: d.linkedTaskId,
          workingOn: d.workingOn,
          notes: d.notes
        },
        create: {
          deliveryId: d.deliveryId,
          clientId: d.clientId,
          clientName: d.clientName,
          postType: d.postType,
          postDate: d.postDate,
          status: d.status,
          linkedTaskId: d.linkedTaskId,
          workingOn: d.workingOn,
          notes: d.notes
        }
      });
      deliveriesCreated++;
    }

    return NextResponse.json({ success: true, clientsCreated, deliveriesCreated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 200 });
  }
}
