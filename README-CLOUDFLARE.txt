Antigravity Dashboard - Cloudflare 설정 순서
===========================================

이미 GitHub 저장소에는 배포에 필요한 파일이 올라가 있습니다.
저장소 주소:
https://github.com/kwonjung86-sketch/antigravity-dashboard

목표:
- Cloudflare Pages에 배포
- D1 데이터베이스 연결
- Google 로그인으로 kwonjung86@gw1.kr 계정만 접속 허용


1. Cloudflare Pages 만들기
-------------------------

1) https://dash.cloudflare.com 에 로그인합니다.
2) 왼쪽 메뉴에서 Workers & Pages로 갑니다.
3) Create application을 누릅니다.
4) Pages를 선택합니다.
5) Connect to Git을 선택합니다.
6) GitHub 저장소 antigravity-dashboard를 선택합니다.
7) 아래처럼 설정합니다.

Project name:
antigravity-dashboard

Production branch:
main

Build command:
비워둡니다.

Build output directory:
public

8) Save and Deploy를 누릅니다.


2. D1 데이터베이스 만들기
------------------------

1) Cloudflare Dashboard > Workers & Pages > D1 SQL Database로 갑니다.
2) Create database를 누릅니다.
3) 이름을 info_db로 만듭니다.
4) 생성한 DB로 들어갑니다.
5) Console 또는 Query 화면에서 schema.sql 파일 내용을 붙여넣고 실행합니다.

schema.sql은 GitHub 저장소 루트에 있습니다.


3. Pages에 D1 연결하기
----------------------

1) Workers & Pages > antigravity-dashboard 프로젝트로 갑니다.
2) Settings > Bindings로 갑니다.
3) Add binding을 누릅니다.
4) D1 database를 선택합니다.
5) 아래처럼 입력합니다.

Variable name:
DB

D1 database:
info_db

6) 저장합니다.
7) Deployments 탭으로 가서 Redeploy를 누릅니다.


4. Google 로그인으로 나만 접속 허용하기
--------------------------------------

1) Cloudflare Dashboard 왼쪽에서 Zero Trust로 들어갑니다.
2) Access > Applications로 갑니다.
3) Add an application을 누릅니다.
4) Self-hosted를 선택합니다.
5) Application name에 Antigravity Dashboard 입력합니다.
6) Application domain에 Pages 주소를 입력합니다.

예시:
antigravity-dashboard.pages.dev

7) Policy를 추가합니다.

Policy name:
Only me

Action:
Allow

Include:
Emails

Email:
kwonjung86@gw1.kr

8) Login methods에서 Google을 사용하도록 설정합니다.
9) 저장합니다.

이제 사이트 접속 시 Google 로그인 화면이 나오고,
kwonjung86@gw1.kr 계정만 들어갈 수 있습니다.


5. Gemini API 키 넣기
--------------------

1) Workers & Pages > antigravity-dashboard > Settings로 갑니다.
2) Variables and Secrets로 갑니다.
3) Add variable을 누릅니다.
4) 아래처럼 추가합니다.

Variable name:
GEMINI_API_KEY

Value:
본인의 Gemini API 키

5) 저장 후 Redeploy합니다.

Gemini API 키가 없어도 화면은 열리지만, AI 운세 해석은 제한됩니다.


6. 사용 방법
------------

1) 배포된 pages.dev 주소로 접속합니다.
2) Google 로그인에서 kwonjung86@gw1.kr 계정으로 로그인합니다.
3) 처음 접속 후 오른쪽 위 갱신 버튼을 눌러 데이터를 수집합니다.
4) 사주 프로필을 등록합니다.


주의
----

자동 아침 갱신용 crawler-worker는 아직 켜지 않는 것을 권장합니다.
사이트 전체를 Google 로그인으로 막으면 자동 Worker도 별도 Access Service Token이 필요합니다.
처음에는 로그인 후 화면의 갱신 버튼으로 수동 갱신해서 쓰는 것이 가장 쉽습니다.
