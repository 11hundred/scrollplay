function setTimeline(t){$(".comments-list").css("height",Math.round(t.duration*magnitude)),$.get(host+"/tracks/"+trackID+"/comments?consumer_key="+consumerKey,function(t){t.sort(function(t,e){return parseFloat(t.timestamp)-parseFloat(e.timestamp)});for(var e,n=0,o=0;o<t.length;o++){var s=Math.round(t[o].timestamp*magnitude);n+e>s&&(s=n+e),$(".comments-list").append('<div id="comment-'+t[o].id+'" class="comment" style="top: '+s+'px;">'+t[o].user.username+": "+t[o].body+"</div>"),e=$(".comments-list .comment").last().outerHeight(),n=s}})}function updateProgress(){$(".bar-progress").css("width",track.position/track.durationEstimate*100+"%"),$(".comments-progress").css("top",Math.round(track.position*magnitude)+"px")}var consumerKey="9994e3c432c77379bee441c98b1a4082",host="https://api.soundcloud.com",trackID=165098282,magnitude=.1,track,SC;SC.initialize({client_id:consumerKey}),$(document).ready(function(){SC.whenStreamingReady(function(){track=SC.stream("/tracks/"+trackID,{autoPlay:!1},function(t){t.play({whileplaying:function(){updateProgress()}}),$.getJSON(host+"/tracks/"+trackID+"?consumer_key="+consumerKey,function(t){setTimeline(t)})})}),$(".status-control").click(function(){track.togglePause()}),$(".progress-bar").click(function(t){track.setPosition(t.pageX/$(window).width()*track.durationEstimate)})});