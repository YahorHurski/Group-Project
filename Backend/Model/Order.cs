namespace Backend.Model;

public class Order
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalPrice { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
