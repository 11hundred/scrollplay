function setTimeline(t){$(".comments-list").css("height",Math.round(t.duration*magnitude)),$.get(host+"/tracks/"+trackID+"/comments?consumer_key="+consumerKey,function(t){t.sort(function(t,e){return parseFloat(t.timestamp)-parseFloat(e.timestamp)});for(var e,a=0,s=0;s<t.length;s++){var n=Math.round(t[s].timestamp*magnitude);a+e>n&&(n=a+e),$(".comments-list").append('<div id="comment-'+t[s].id+'" class="comment" style="top: '+n+'px;"><img class="avatar" src="'+t[s].user.avatar_url+'">'+t[s].user.username+": "+t[s].body+"</div>"),e=$(".comments-list .comment").last().outerHeight(),a=n}})}function updateProgress(){$(".bar-progress").css("width",track.position/track.durationEstimate*100+"%"),$(".comments-progress").css("top",Math.round(track.position*magnitude)+"px")}var consumerKey="9994e3c432c77379bee441c98b1a4082",host="https://api.soundcloud.com",trackID=165098282,magnitude=.1,track,SC;SC.initialize({client_id:consumerKey}),$(document).ready(function(){SC.whenStreamingReady(function(){track=SC.stream("/tracks/"+trackID,{autoPlay:!1},function(t){t.play({whileplaying:function(){updateProgress()}}),$.get(host+"/tracks/"+trackID+"?consumer_key="+consumerKey,function(t){setTimeline(t)})})}),$(".status-control").click(function(){track.togglePause()}),$(".progress-bar").click(function(t){track.setPosition(t.pageX/$(window).width()*track.durationEstimate)})});