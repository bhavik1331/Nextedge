✅ Admin user created successfully!
Username: admin
Email: admin@nextedge.com
Password: admin123 (use this to login)


create Treasurer :  npm run create:treasurer -- --name "Pallvai Treasurer" --email "pallavi.treasurer@nextedge.com" --password "pallavi@12345"


> server@1.0.0 create:treasurer
> node createTreasurer.js --name Pallvai Treasurer --email pallavi.treasurer@nextedge.com --password pallavi@12345

[dotenv@17.2.3] injecting env (14) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
Created TREASURER account.
Name: Pallvai Treasurer
Email: pallavi.treasurer@nextedge.com
Role: TREASURER
Active: true


npm run create:clubhead -- --name "Club Head Name" --email "clubhead@nextedge.com" --password "StrongPass123"

If email already exists and you want to convert/update it:
npm run create:clubhead -- --name "Club Head Name" --email "clubhead@nextedge.com" --password "StrongPass123" --force



npm run create:clubhead -- --name "Raj Nimase" --email "techclubhead@nextedge.com" --password "TechHead123"

PS C:\Users\User\Desktop\capston\NES\Nextedge\server> npm run create:clubhead -- --name "Raj Nimase" --email "techclubhead@nextedge.com" --password "TechHead123"

> server@1.0.0 create:clubhead
> node createClubHead.js --name Raj Nimase --email techclubhead@nextedge.com --password TechHead123

[dotenv@17.2.3] injecting env (14) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
Created CLUB_HEAD account.
Name: Raj Nimase
Email: techclubhead@nextedge.com
Role: CLUB_HEAD
Active: true