## Rendering Strategies in TrustTrip

In Next.js, choosing the right rendering strategy affects performance, scalability, and data freshness. TrustTrip uses a mix of static, dynamic, and hybrid rendering based on how frequently data changes.

### Static Rendering (SSG)
Static rendering is used for content that rarely changes.

**Example:** Refund Policy page  
The cancellation rules are fixed and apply to all users, so the page is statically generated. This ensures very fast load times and high scalability.

**Trade-off:**  
Fast and scalable, but content does not update in real time.

---

### Dynamic Rendering (SSR)
Dynamic rendering is used when data must always be fresh and calculated per request.

**Example:** Refund calculation result  
Refund amounts depend on user inputs like fare and cancellation time, so they are computed dynamically to ensure accuracy.

**Trade-off:**  
Always fresh and correct, but slower and more expensive at scale.

---

### Hybrid Rendering (ISR / Revalidation)
Hybrid rendering balances performance and freshness by revalidating data at intervals.

**Example:** Refund rules configuration  
Rules can be cached and revalidated periodically so users get fast responses while updates are reflected automatically.

**Trade-off:**  
Good balance between speed, freshness, and scalability.

---

## Case Study: The News Portal That Felt Outdated

In the DailyEdge scenario, static rendering made the homepage fast but caused breaking news to become outdated. Switching fully to dynamic rendering improved freshness but reduced performance and increased costs.

A balanced solution would use:
- Static rendering for layouts and evergreen sections
- Dynamic rendering for breaking news
- Hybrid rendering with revalidation for frequently updated sections

This approach balances speed, freshness, and scalability.

---

## Conclusion

TrustTrip chooses rendering strategies based on data volatility:
- Static for fixed content
- Dynamic for real-time calculations
- Hybrid for occasionally changing data

This ensures the application remains fast, scalable, and reliable.