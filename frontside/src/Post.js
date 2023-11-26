import {formatISO9075} from "date-fns";
import {Link} from "react-router-dom";
import styled from "styled-components"

const StylePost = styled.div`
img{
  height:280px;
  width:100%;
  object-fit:cover;
}
.box{
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
}
.texts .content
{
    max-height: 3rem;
    overflow: hidden;
    color:gray;
}

`

export default function Post({_id,title,summary,cover,content,createdAt,author}) {

  return (
    <StylePost>
    <div className="post box">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/'+cover} alt=""/>
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}>
        <h2 className="title">{title}</h2>
        
        </Link>
        
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
        <p className="content">{content}</p>
      </div>
    </div></StylePost>
  );
}