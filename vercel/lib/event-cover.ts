export function eventCover(title:string){
 if(/music|unplugged|acoustic/i.test(title))return '/images/event-music.webp';
 if(/football|sports|campus cup/i.test(title))return '/images/event-sports.webp';
 if(/design|creative|careers|alumni/i.test(title))return '/images/event-design.webp';
 if(/tech|ai basics|hackathon|line follower|robot/i.test(title))return '/images/event-technology.webp';
 return '/images/campus-gathering.jpg';
}
