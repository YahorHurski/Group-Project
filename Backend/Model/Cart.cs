namespace Backend.Model;

public class Cart
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
