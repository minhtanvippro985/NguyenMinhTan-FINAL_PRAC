
const nameInput = document.getElementById("iName")
const priceInput = document.getElementById("iPrice")
const stockInput = document.getElementById("iStock")
const searchInput = document.getElementById("searchInput")
const sortSelect = document.getElementById("sortSelect")
const pageSizeSelect = document.getElementById("pageSz")
const tbody = document.getElementById("tbody")
const emptyState = document.getElementById("emptyState")
const formTitle = document.getElementById("formTitle")
const submitBtn = document.getElementById("btnSubmit")
const totalBadge = document.getElementById("totalBadge")
const pagInfo = document.getElementById("pagInfo")
const pagCtrl = document.getElementById("pagCtrl")
let products = JSON.parse(localStorage.getItem("v")) || []
let editId = null
let currentPage = 1
let pageSize = Number(pageSizeSelect.value)

function saveProducts() {
  localStorage.setItem("v", JSON.stringify(products))
}
function gen() {
  if (products.length === 0) return 1
  const maxId = Math.max(...products.map(p => p.id))
  return maxId + 1
}
function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN") + " ₫"
}
function validateProduct(name, price, stock) {
  if (!name.trim()) {
    alert("Vui lòng nhập tên sản phẩm.")
    return false
  }
  const existed = products.find(p =>
    p.name.toLowerCase() === name.toLowerCase() &&
    p.id !== editId
  )
  if (existed) {
    alert("Tên sản phẩm đã tồn tại.")
    return false
  }
  if (price <= 0 || isNaN(price)) {
    alert("Giá phải là số dương lớn hơn 0.")
    return false
  }
  if (!Number.isInteger(stock) || stock < 0) {
    alert("Tồn kho phải là số nguyên lớn hơn hoặc bằng 0.")
    return false
  }
  return true
}

function submitForm() {
  const name = nameInput.value.trim()

  if (!validateProduct(name, price, stock)) return
  if (editId === null) {
    const newProduct = {
      id: gen(),
      name: nameInput.value,
      price: +priceInput.value,
      stock: +stockInput.value
    }
    products.push(newProduct)
    alert("Thêm sản phẩm thành công")
  } 

  else {
    const index = products.findIndex(p => p.id === editId)
    products[index].name = name
    products[index].price = price
    products[index].stock = stock
    alert("Cập nhật sản phẩm thành công")
  }
  saveProducts()
  resetForm()
  currentPage = 1
  renderData()
}



function editProduct(id) {

  const product = products.find(p => p.id === id)

  nameInput.value = product.name
  priceInput.value = product.price
  stockInput.value = product.stock

  editId = id

  formTitle.innerText = "Chỉnh sửa sản phẩm"
  submitBtn.innerText = "Lưu thay đổi"
}
function deleteProduct(id) {
  const confirmDelete = confirm("Bạn có chắc muốn xóa sản phẩm không?")
  if (!confirmDelete) return
  products = products.filter(p => p.id !== id)
  alert("Xóa sản phẩm thành công!")
  saveProducts()
  currentPage = 1
  renderData()
}

function getFilteredProducts() {
  let keyword = searchInput.value.toLowerCase()
  let filtered = products.filter(product =>
    product.name.toLowerCase().includes(keyword)
  )
  const sortValue = sortSelect.value
  switch (sortValue) {
    case "name_asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "name_desc":
      filtered.sort((a, b) => b.name.localeCompare(a.name))
      break
    case "price_asc":
      filtered.sort((a, b) => a.price - b.price)
      break
    case "price_desc":
      filtered.sort((a, b) => b.price - a.price)
      break
  }
  return filtered
}

function pagerProducts(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  pagInfo.innerHTML =
    `Hiển thị <strong>${start}</strong> – <strong>${end}</strong> trong <strong>${totalItems}</strong> sản phẩm`
  pagCtrl.innerHTML = ""
  const prevBtn = document.createElement("button")
  prevBtn.innerText = "‹"
  prevBtn.className = "pg"

  if (currentPage === 1) prevBtn.disabled = true

  prevBtn.onclick = () => {
    currentPage--
    renderData()
  }
  pagCtrl.appendChild(prevBtn)
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button")
    pageBtn.innerText = i
    pageBtn.className = "pg"

    if (i === currentPage) pageBtn.classList.add("active")

    pageBtn.onclick = () => {
      currentPage = i
      renderData()
    }

    pagCtrl.appendChild(pageBtn)
  }


  const nextBtn = document.createElement("button")
  nextBtn.innerText = "›"
  nextBtn.className = "pg"

  if (currentPage === totalPages) nextBtn.disabled = true

  nextBtn.onclick = () => {
    currentPage++
    renderTable()
  }

  pagCtrl.appendChild(nextBtn)
}

function renderData() {
  const data = getFilteredProducts()
  totalBadge.innerText = data.length + " sản phẩm"
  if (data.length === 0) {
    tbody.innerHTML = ""
    emptyState.style.display = "block"
    return
  }
  emptyState.style.display = "none"
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pageData = data.slice(startIndex, endIndex)
  tbody.innerHTML = ""
  pageData.forEach((product, index) => {
    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td>${startIndex + index + 1}</td>
      <td class="td-name">${product.name}</td>
      <td class="td-price">${formatPrice(product.price)}</td>
      <td class="center">${product.stock}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-edit" onclick="editProduct(${product.id})">✏ Sửa</button>
          <button class="btn btn-sm btn-del" onclick="deleteProduct(${product.id})">✕ Xóa</button>
        </div>
      </td>
    `

    tbody.appendChild(tr)

  })

  pagerProducts(data.length)
}
function dataNOW() {
  if (products.length === 0) {
    products = [
      { id: 1, name: "Laptop Dell XPS 13", price: 28500000, stock: 12 },
      { id: 2, name: "Chuột Logitech MX Master", price: 1850000, stock: 34 },
      { id: 3, name: "Bàn phím Keychron K2", price: 2200000, stock: 7 },
      { id: 4, name: "Áo thun Basic Uniqlo", price: 390000, stock: 0 },
      { id: 5, name: "Cà phê rang xay 500g", price: 185000, stock: 58 }
    ]
    saveProducts()
  }
  renderData()
}



function resetForm() {
  nameInput.value = ""
  priceInput.value = ""
  stockInput.value = ""
  editId = null
  formTitle.innerText = "Thêm sản phẩm mới"
  submitBtn.innerText = "Thêm sản phẩm"
}
searchInput.addEventListener("input", () => {
  currentPage = 1
  renderData()
})
sortSelect.addEventListener("change", () => {
  currentPage = 1
  renderData()
})
pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value)
  currentPage = 1
  renderData()
})

dataNOW()