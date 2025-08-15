import { useSession } from "../auth-clinet";
import type { Session } from "../auth-clinet";

export function GuestAuth(){
    const {data: session, isPending, error} = useSession() as {
        data: (Session & { user: { isGuest?: boolean } }) | null;
        isPending: boolean;
        error: Error | null;
    }


    if(isPending){
        return <div>로딩중...</div>
    }
 
    if(!session){
        return <div>로그인되지 않음</div>
    }

    if(error){
        return <div>에러 발생</div>
    }

    return <div>
        <div>{session.user.name}</div>
        {session.user.isGuest && <div>게스트</div>}
    </div>
}