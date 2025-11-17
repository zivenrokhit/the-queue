import thumbsUpIcon from './assets/thumbsUp.svg';
import linkIcon from './assets/Link.svg';

export default function Post(props){
        const playlist = props.data   
        const songs = playlist.songs
        const name = playlist.name
        const username = playlist.username
        const likes = playlist.likes
        const noOfSongs = songs.length;
        let height = 500
        

        if (noOfSongs > 10) {
            height = 400
        } else {
           height = noOfSongs*40
        }
        console.log(height, "asdfsdf")


        return  <div id="post">
                    <h1>{username}</h1>
                    <h2>{name}</h2>
                    <h3>No of songs: {noOfSongs}</h3>
                    <div id="songs-box" styles = {`height:${height}`}>
                        {songs.map((song) => {
                            return <div>
                                        <h4>{song.title} | {song.artist} |</h4>
                                        <a href={song.link}>
                                            <img src={linkIcon} alt="song link icon" width="20px" height="20px"/>
                                        </a>
                                    </div>
                                })}
                        
                    </div>
                    <div id="bottom-bar">
                        <div id="like-button">
                            <p>{likes}</p>
                            <img src={thumbsUpIcon} alt="Thumbs Up Icon"/>
                        </div>
                    </div>
                </div>
    
           
}