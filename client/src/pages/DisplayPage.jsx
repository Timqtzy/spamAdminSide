import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DisplayPage = React.memo(() => {
  const [loadingState, setloadingState] = useState(false);
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
    category: "",
    readTime: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully!");
    window.location.href = "/";
  };

  useEffect(() => {
    fetchLimitedCards();
  }, []);

  const apiUrl = "https://spam-admin-side-y74w.vercel.app/";

  const fetchLimitedCards = async (page) => {
    try {
      const { data } = await axios.get(`${apiUrl}api/cards?page=${page}`, {
        headers: getAuthHeader(),
      });

      if (data.length === 0) {
        toast.info("No more cards to load.");
        return; // Stop if no more data
      }

      setCards((prevCards) => {
        const newCards = data.filter(
          (newCard) => !prevCards.some((card) => card._id === newCard._id)
        );
        return [...prevCards, ...newCards];
      });
    } catch (error) {
      toast.error("Failed to load data.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setFormData((prev) => {
      if (prev[name] === newValue) return prev; // Avoid redundant updates
      return { ...prev, [name]: newValue };
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image: null,
      category: "",
      readTime: "",
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setloadingState(true);
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const form = new FormData();
    Object.entries({ ...formData, slug, author: "SPAM" }).forEach(
      ([key, value]) => {
        form.append(key, value);
      }
    );

    try {
      const { data } = await axios.post(`${apiUrl}api/cards`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAuthHeader(),
        },
      });
      setCards((prevCards) => [...prevCards, data]);
      toast.success("Blog added successfully!");
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred during upload."
      );
    } finally {
      setloadingState(false);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({ ...card, image: null });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setloadingState(true);
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    try {
      const { data } = await axios.put(
        `${apiUrl}api/cards/${editingCard._id}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...getAuthHeader(),
          },
        }
      );
      setCards(
        cards.map((card) => (card._id === editingCard._id ? data : card))
      );
      toast.success("Blog updated successfully!");
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred during update."
      );
    } finally {
      setloadingState(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}api/cards/${deleteCardId}`, {
        headers: getAuthHeader(),
      });
      setCards((prevCards) =>
        prevCards.filter((card) => card._id !== deleteCardId)
      );
      toast.success("Blog deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete blog.");
    } finally {
      setShowDeleteDialog(false);
      setDeleteCardId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 mx-auto">
      <ToastContainer />

      <div className="text-center p-4">
        <h2 className="text-4xl font-sans font-semibold"> Blogs</h2>
      </div>
      <div className="my-4 flex justify-between">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center p-4 bg-[#04AA6D] text-white rounded cursor-pointer hover:bg-[#04aa6dbd] transition-colors duration-200"
        >
          <FaPlus className="mr-2" /> Add Blog
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center p-4 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-gray-400">No content available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {cards.map((card) => (
            <div
              key={card._id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-200"
            >
              <img
                src={`${card.image}?q=60&f_auto`}
                alt={card.title}
                className="w-full h-40 object-cover rounded-t-md"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">{card.title}</h3>
                <p className="text-sm mt-2 truncate">{card.content}</p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleEdit(card)}
                    className="flex items-center px-3 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteDialog(true);
                      setDeleteCardId(card._id);
                    }}
                    className="flex items-center px-3 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition-colors duration-200"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
          >
            <h2 className="text-2xl font-bold text-pink-500 mb-4 text-center">
              Edit Blog
            </h2>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
              required
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
              required
            />
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
            />
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
            />
            <input
              type="text"
              name="readTime"
              value={formData.readTime}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200"
              >
                {" "}
                {loadingState ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleAddSubmit}
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
          >
            <h2 className="text-2xl font-bold text-pink-500 mb-4 text-center">
              Add Blog
            </h2>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
              required
            />
            <textarea
              name="content"
              placeholder="Content"
              value={formData.content}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
              required
            />
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
              required
            />
            <input
              type="text"
              name="readTime"
              placeholder="Read Time (e.g., 5)"
              value={formData.readTime}
              onChange={handleInputChange}
              className="block w-full bg-gray-700 border border-gray-600 rounded p-2 text-white mb-4"
              required
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors duration-200"
                disabled={loadingState}
              >
                {loadingState ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : (
                  "Add Blog"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold text-red-500 mb-4 text-center">
              Confirm Deletion
            </h2>
            <p className="text-gray-300 text-center mb-4">
              Are you sure you want to delete this blog? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default DisplayPage;
