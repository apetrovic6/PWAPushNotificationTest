using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol.Plugins;
using WebPush;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private string privateKey = @"";
        private string publicKey = @"";
        private string subject = "";
        
        private static List<NotificationSubscription> subscriptions { get; set; } = new();
        [HttpGet]
        public Task<List<NotificationSubscription>> GetSubscriptions()
        {
            return Task.FromResult(subscriptions);
        }

        [HttpPost]
        public Task<List<NotificationSubscription>> AddSubscription([FromBody] NotificationSubscription subscription)
        {
            bool exists = false;
            
            subscription.UserId = subscriptions.Count.ToString();
            foreach (var sub in subscriptions)
            {
                if (sub.Auth == subscription.Auth)
                {
                    exists = true;
                }
            }

            if (!exists)
            {
                subscriptions.Add(subscription);
            }

            return Task.FromResult<List<NotificationSubscription>>(subscriptions);
        }
        [HttpPost("send/{userId}")]
        public async void SendNotification(string userId)
        {
            var subDetails = subscriptions.Find(x => x?.UserId == userId);
            if(subDetails is null) return;
            
            var subscription = new PushSubscription(subDetails.Url, subDetails.P256dh, subDetails.Auth);
            var vapidDetails = new VapidDetails(subject, publicKey, privateKey);
            
            var webPushClient = new WebPushClient();
            try
            {
                var payload = JsonSerializer.Serialize(
                    new
                    {
                        title = "Some Title",
                        message = "Test Message",
                        url = "http://www.youtube.com"
                    });
                
                await webPushClient.SendNotificationAsync(subscription, payload, vapidDetails);
                //await webPushClient.SendNotificationAsync(subscription, "payload", gcmAPIKey);
            }
            catch (WebPushException exception)
            {
                Console.WriteLine("Http STATUS code" + exception.StatusCode + exception.Message);
            }
        }
    }
    
    
    public class NotificationSubscription
    {
        public int NotificationSubscriptionId { get; set; }

        public string UserId { get; set; }

        public string Url { get; set; }

        public string P256dh { get; set; }

        public string Auth { get; set; } 
    }
}
